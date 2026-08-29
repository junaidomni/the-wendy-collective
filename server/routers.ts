import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { createAdvisorDeal, createTripInquiry, getTripInquiries } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { sendTripBriefEmail } from "./resendAlerts";
import { groupCruisesRouter } from "./routers/groupCruises";
import { crmRouter } from "./routers/crm";

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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  inquiries: router({
    create: publicProcedure.input(tripInquiryInput).mutation(async ({ input }) => {
      const inquiry = await createTripInquiry({ ...input, destinations: JSON.stringify(input.destinations) });
      try {
        await createAdvisorDeal({
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
      const [ownerNotificationSent, emailAlertStatus] = await Promise.all([
        notifyOwnerWithRetry("New trip inquiry · The Wendy Collective", content),
        sendTripBriefEmail({ inquiryId: inquiry.id, ...input }),
      ]);
      if (!ownerNotificationSent && emailAlertStatus !== "sent") {
        console.error("[Inquiries] All owner alert channels failed", { inquiryId: inquiry.id });
      }
      return { success: true, inquiryId: inquiry.id, ownerNotificationSent, emailAlertStatus };
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
