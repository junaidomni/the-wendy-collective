import { z } from "zod";
import { createAdvisorDeal, createGroupCabinRequest, getGroupCabinRequests, getPrivateGroupTravelProfile, updateGroupCabinRequestStatus } from "../db";
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
  consent: z.literal(true),
  privateToken: z.string().trim().min(32).max(96).optional(),
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
    const request = await createGroupCabinRequest(input);
    const travelerCount = input.rooms.reduce((total, room) => total + room.travelers.length, 0);
    try {
      await createAdvisorDeal({
        sourceType: "group_cabin_request",
        sourceId: request.id,
        contactFirstName: input.contactFirstName,
        contactLastName: input.contactLastName,
        email: input.email,
        phone: input.phone,
        title: "Grimsley High School Graduation Cruise 2027",
        travelSummary: `${input.rooms.length} requested rooms for ${travelerCount} travelers. ${input.notes || ""}`,
        stage: "new_inquiry",
        nextAction: "Review school cruise cabin request and prepare quote",
      });
    } catch (error) { console.error("[Group cruise] CRM handoff failed", { requestId: request.id, error }); }
    const content = [
      `New Grimsley cabin request from ${input.contactFirstName} ${input.contactLastName}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Rooms requested: ${input.rooms.length}`,
      `Travelers listed: ${travelerCount}`,
      `Preferences: ${input.amenities.join(", ") || "None selected"}`,
      "Open Wendy’s workspace to review the room details and begin the quote.",
    ].join("\n");
    const [ownerNotificationSent, emailAlertStatus] = await Promise.all([
      notifyWendy("New Grimsley cabin request · The Wendy Collective", content),
      sendGroupCabinRequestEmail({ requestId: request.id, contactFirstName: input.contactFirstName, contactLastName: input.contactLastName, email: input.email, phone: input.phone, rooms: input.rooms.length, travelers: travelerCount }),
    ]);
    return { success: true, requestId: request.id, ownerNotificationSent, emailAlertStatus };
  }),
  listCabinRequests: adminProcedure.query(() => getGroupCabinRequests()),
  updateCabinRequestStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(statuses), advisorNotes: z.string().trim().max(4000).default("") })).mutation(async ({ input }) => {
    await updateGroupCabinRequestStatus(input.id, input.status, input.advisorNotes);
    return { success: true };
  }),
});
