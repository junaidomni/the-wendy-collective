import { z } from "zod";
import { createAdvisorAlert, createFamilyPortalCabinRequest, createFamilyPortalRevision, getGroupCabinRequests, getPrivateFamilyPortal, getPrivateGroupTravelProfile, updateGroupCabinRequestStatus } from "../db";
import { notifyOwner } from "../_core/notification";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { sendGroupCabinRequestEmail } from "../resendAlerts";

const travelerInput = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().max(80).optional().default(""),
  lastName: z.string().trim().min(1).max(80),
  age: z.number().int().min(0).max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  loyaltyNumber: z.string().trim().max(100).optional().default(""),
});

const roomInput = z.object({
  occupancy: z.number().int().min(2).max(4),
  roomType: z.enum(["interior", "ocean_view", "balcony", "suite"]),
  locationPreference: z.enum(["no_preference", "forward", "midship", "aft"]),
  selectedCabinCategory: z.string().trim().min(2).max(180).optional(),
  estimatedFareCents: z.number().int().min(0).max(5_000_000).optional(),
  estimatedGratuitiesCents: z.number().int().min(0).max(1_000_000).optional(),
  estimatedProtectionCents: z.number().int().min(0).max(1_000_000).optional(),
  travelers: z.array(travelerInput).min(2).max(4),
}).superRefine((room, context) => {
  if (room.travelers.length !== room.occupancy) context.addIssue({ code: "custom", message: "Each room must include the selected number of travelers." });
});

const cabinRequestInput = z.object({
  groupKey: z.literal("grimsley-hs-graduation-cruise-2027"),
  contactFirstName: z.string().trim().min(2).max(80),
  contactLastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(40),
  notes: z.string().trim().max(2000).optional().default(""),
  amenities: z.array(z.enum(["wifi", "beverage_package", "soda_package", "specialty_dining", "travel_protection", "transfers"])).max(6).default([]),
  extras: z.object({
    wifiPlan: z.string().trim().max(80).optional(),
    wifiUsers: z.number().int().min(0).max(4).optional(),
    cheersAdults: z.number().int().min(0).max(4).optional(),
    diningExperience: z.string().trim().max(120).optional(),
    diningAdults: z.number().int().min(0).max(12).optional(),
    diningChildren: z.number().int().min(0).max(12).optional(),
    diningTotalCents: z.number().int().min(0).max(100_000).optional(),
    rateQualifiers: z.array(z.enum(["military", "interline", "senior_55_plus"])).max(3).optional(),
  }).optional(),
  estimate: z.object({
    cabinTotalCents: z.number().int().min(0).max(20_000_000),
    extrasTotalCents: z.number().int().min(0).max(10_000_000),
    tripTotalCents: z.number().int().min(0).max(30_000_000),
    depositCents: z.number().int().min(0).max(2_000_000),
    onboardCreditCents: z.number().int().min(0).max(2_000_000),
  }).optional(),
  consent: z.literal(true),
  privateToken: z.string().trim().min(32).max(96).optional(),
  familyPortalToken: z.string().trim().min(32).max(96).optional(),
  rooms: z.array(roomInput).min(1).max(12),
});

const statuses = ["new", "contacted", "details_received", "quote_in_progress", "quote_shared", "booked", "closed"] as const;

async function notifyWendy(title: string, content: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { if (await notifyOwner({ title, content })) return true; } catch (error) { console.error("[Group cruise] Owner alert failed", error); }
  }
  return false;
}

export const groupCruisesRouter = router({
  createCabinRequest: publicProcedure.input(cabinRequestInput).mutation(async ({ input }) => {
    if (input.privateToken) {
      const privateProfile = await getPrivateGroupTravelProfile(input.privateToken);
      if (!privateProfile || privateProfile.profile.groupKey !== input.groupKey) throw new Error("This private group link is no longer available.");
    }
    const familyPortal = input.familyPortalToken ? await getPrivateFamilyPortal(input.familyPortalToken) : undefined;
    if (input.familyPortalToken && (!familyPortal || familyPortal.profile.groupKey !== input.groupKey)) throw new Error("This private family update link is no longer available.");
    const request = input.familyPortalToken
      ? await createFamilyPortalRevision(input.familyPortalToken, input)
      : await createFamilyPortalCabinRequest(input);
    const travelerCount = input.rooms.reduce((total, room) => total + room.travelers.length, 0);
    const isUpdate = Boolean(input.familyPortalToken);
    const content = [
      `${isUpdate ? "Updated" : "New"} Grimsley cabin request from ${input.contactFirstName} ${input.contactLastName}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Rooms requested: ${input.rooms.length}`,
      `Travelers listed: ${travelerCount}`,
      `Preferences: ${input.amenities.join(", ") || "None selected"}`,
      "Open Wendy’s workspace to review the room details and begin the quote.",
    ].join("\n");
    const [ownerNotificationSent, emailAlertStatus, portalAlertStored] = await Promise.all([
      notifyWendy(`${isUpdate ? "Updated" : "New"} Grimsley cabin request · The Wendy Collective`, content),
      sendGroupCabinRequestEmail({ requestId: request.id, revisionNumber: request.revisionNumber, contactFirstName: input.contactFirstName, contactLastName: input.contactLastName, email: input.email, phone: input.phone, notes: input.notes, amenities: input.amenities, extras: input.extras, estimate: input.estimate, rooms: input.rooms }),
      createAdvisorAlert({
        sourceType: "group_request",
        sourceId: request.id,
        groupKey: input.groupKey,
        title: `${isUpdate ? "Updated" : "New"} Grimsley family request`,
        detail: `${input.contactFirstName} ${input.contactLastName} submitted ${input.rooms.length} room${input.rooms.length === 1 ? "" : "s"} for ${travelerCount} traveler${travelerCount === 1 ? "" : "s"}.`,
        href: "/wendy/groups/grimsley",
      }).then(() => true).catch((error) => { console.error("[Group cruise] Portal alert failed", { requestId: request.id, error }); return false; }),
    ]);
    return { success: true, requestId: request.id, familyPortalToken: request.familyPortalToken, revisionNumber: request.revisionNumber, ownerNotificationSent, emailAlertStatus, portalAlertStored };
  }),
  getFamilyPortal: publicProcedure.input(z.object({ token: z.string().trim().min(32).max(96) })).query(({ input }) => getPrivateFamilyPortal(input.token)),
  listCabinRequests: adminProcedure.query(() => getGroupCabinRequests()),
  updateCabinRequestStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(statuses), advisorNotes: z.string().trim().max(4000).default("") })).mutation(async ({ input }) => {
    await updateGroupCabinRequestStatus(input.id, input.status, input.advisorNotes);
    return { success: true };
  }),
});
