import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { createAdvisorAlert, createAdvisorDeal, createTripInquiry, getTripInquiries, upsertUser } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { sendTripBriefEmail } from "./resendAlerts";
import { groupCruisesRouter } from "./routers/groupCruises";
import { crmRouter } from "./routers/crm";
import { sdk } from "./_core/sdk";
import { STAFF_SESSION_DURATION_MS, verifyStaffCredentials } from "./staffAuth";

const tripInquiryInput = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(40),
  travelType: z.enum(["caribbean", "mexico", "allInclusive", "groupTravel", "cruise", "custom"]),
  destinations: z.array(z.string().trim().min(2).max(80)).min(1).max(8),
  travelTiming: z.string().trim().min(2).max(120),
  dateFlexibility: z.enum(["exact", "flexible", "unsure"]),
  budget: z.string().trim().min(2).max(120),
  groupSize: z.number().int().min(1).max(100),
  priorities: z.string().trim().max(2000).optional().default(""),
});

async function notifyOwnerWithRetry(title: string, content: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (await notifyOwner({ title, content })) return true;
    } catch (error) {
      console.error("[Notifications] Owner alert attempt failed", error);
    }
  }
  return false;
}

const staffLoginAttempts = new Map<string, { count: number; resetAt: number }>();
const STAFF_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const STAFF_LOGIN_MAX_ATTEMPTS = 5;

function staffLoginAttemptKey(headers: Record<string, string | string[] | undefined>, ip?: string) {
  const forwarded = headers["x-forwarded-for"];
  const clientAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0] ?? ip ?? "unknown";
  return clientAddress.trim();
}

function ensureStaffLoginAvailable(key: string) {
  const attempt = staffLoginAttempts.get(key);
  if (!attempt || attempt.resetAt <= Date.now()) {
    staffLoginAttempts.delete(key);
    return;
  }
  if (attempt.count >= STAFF_LOGIN_MAX_ATTEMPTS) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many sign-in attempts. Please wait a few minutes and try again." });
}

function recordFailedStaffLogin(key: string) {
  const now = Date.now();
  const previous = staffLoginAttempts.get(key);
  const active = previous && previous.resetAt > now ? previous : { count: 0, resetAt: now + STAFF_LOGIN_WINDOW_MS };
  staffLoginAttempts.set(key, { count: active.count + 1, resetAt: active.resetAt });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    staffLogin: publicProcedure.input(z.object({ username: z.enum(["wendy", "junaid"]), password: z.string().min(1).max(200) })).mutation(async ({ ctx, input }) => {
      const attemptKey = staffLoginAttemptKey(ctx.req.headers, ctx.req.ip);
      ensureStaffLoginAvailable(attemptKey);
      const staff = verifyStaffCredentials(input.username, input.password);
      if (!staff) {
        recordFailedStaffLogin(attemptKey);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect staff username or password." });
      }
      staffLoginAttempts.delete(attemptKey);
      await upsertUser({ openId: staff.openId, name: staff.name, email: staff.email, loginMethod: "twc_staff_password", role: "admin", lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(staff.openId, { expiresInMs: STAFF_SESSION_DURATION_MS, name: staff.name });
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: STAFF_SESSION_DURATION_MS });
      return { success: true as const, user: { name: staff.name, username: staff.username } };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  inquiries: router({
    create: publicProcedure.input(tripInquiryInput).mutation(async ({ input }) => {
      const inquiry = await createTripInquiry({ ...input, destinations: JSON.stringify(input.destinations) });
      let dealId: number | undefined;
      try {
        const deal = await createAdvisorDeal({
          sourceType: "trip_inquiry",
          sourceId: inquiry.id,
          contactFirstName: input.firstName,
          contactLastName: input.lastName,
          email: input.email,
          phone: input.phone,
          title: `${input.travelType} travel inquiry`,
          travelSummary: `Destinations: ${input.destinations.join(", ")}. Timing: ${input.travelTiming}. Travelers: ${input.groupSize}. ${input.priorities || ""}`,
          stage: "new_inquiry",
          nextAction: "Review inquiry and schedule discovery call",
        });
        dealId = deal.id;
      } catch (error) { console.error("[Inquiries] CRM handoff failed", { inquiryId: inquiry.id, error }); }
      const content = [
        `New trip inquiry from ${input.firstName} ${input.lastName}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone}`,
        `Travel type: ${input.travelType}`,
        `Destinations: ${input.destinations.join(", ")}`,
        `Timing: ${input.travelTiming} (${input.dateFlexibility})`,
        `Budget: ${input.budget}`,
        `Travelers: ${input.groupSize}`,
        `Priorities: ${input.priorities || "Not provided"}`,
      ].join("\n");
      const [ownerNotificationSent, emailAlertStatus, portalAlertStored] = await Promise.all([
        notifyOwnerWithRetry("New trip inquiry · The Wendy Collective", content),
        sendTripBriefEmail({ inquiryId: inquiry.id, ...input }),
        createAdvisorAlert({
          sourceType: "public_inquiry",
          sourceId: inquiry.id,
          title: "New website inquiry needs Wendy’s response",
          detail: `${input.firstName} ${input.lastName} is interested in ${input.travelType.replace(/([A-Z])/g, " $1").toLowerCase()}.`,
          href: dealId ? `/wendy/clients/${dealId}` : "/wendy/pipeline/new_inquiry",
        }).then(() => true).catch((error) => { console.error("[Inquiries] Portal alert failed", { inquiryId: inquiry.id, error }); return false; }),
      ]);
      if (!ownerNotificationSent && emailAlertStatus !== "sent") {
        console.error("[Inquiries] All owner alert channels failed", { inquiryId: inquiry.id });
      }
      return { success: true, inquiryId: inquiry.id, ownerNotificationSent, emailAlertStatus, portalAlertStored };
    }),
  }),
  privateExperience: router({
    dashboard: adminProcedure.query(async ({ ctx }) => ({
      firstName: ctx.user.name?.trim().split(/\s+/)[0] ?? null,
      inquiries: await getTripInquiries(),
    })),
  }),
  groupCruises: groupCruisesRouter,
  crm: crmRouter,
});

export type AppRouter = typeof appRouter;
