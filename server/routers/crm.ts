import { randomBytes } from "node:crypto";
import { z } from "zod";
import { advanceAdvisorDealWorkflow, advanceGroupWorkflow, createAdvisorAlert, createAdvisorDeal, createClientProposal, createCruiseExperience, createProposalResponse, deletePublicWebsiteInquiry, ensureGrimsleyCruiseExperience, ensureGrimsleyGroupProfile, getGroupTravelProfile, getPrivateClientProposal, getPrivateGroupTravelProfile, getTripInquiries, listAdvisorAlerts, listAdvisorDeals, listClientProposals, listCruiseExperiences, listProposalResponses, listWorkflowStageEvents, markAdvisorAlertRead, markClientProposalShared, reopenAdvisorDealWorkflow, reopenGroupWorkflow, saveGroupWorkflowDetails, shareGroupTravelProfile, syncExistingRequestsToAdvisorDeals, updateAdvisorDeal, updateGroupTravelProfile, updateProposalResponseStatus } from "../db";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const dealStages = ["new_inquiry", "discovery_call", "building_proposal", "proposal_shared", "family_details", "ready_to_book", "booking", "booked", "closed"] as const;
const groupProfileStages = ["group_setup", "proposal_build", "ready_to_share", "family_details", "live_quote", "booking", "booked", "closed"] as const;
const groupShareStatuses = ["draft", "shared", "paused", "closed"] as const;
const roomInput = z.object({ occupancy: z.number().int().min(1).max(8), roomType: z.string().trim().min(2).max(80), locationPreference: z.string().trim().min(2).max(80), travelerDetails: z.array(z.object({ fullName: z.string().trim().min(2).max(160), dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).min(1).max(8) });

async function notifyWendy(title: string, content: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { if (await notifyOwner({ title, content })) return true; } catch (error) { console.error("[CRM] Owner alert failed", error); }
  }
  return false;
}

export const crmRouter = router({
  dashboard: adminProcedure.query(async () => {
    const grimsleyExperience = await ensureGrimsleyCruiseExperience();
    await ensureGrimsleyGroupProfile();
    await syncExistingRequestsToAdvisorDeals();
    const [deals, experiences, proposals, responses, grimsleyProfile, alerts, websiteInquiries] = await Promise.all([listAdvisorDeals(), listCruiseExperiences(), listClientProposals(), listProposalResponses(), getGroupTravelProfile("grimsley-hs-graduation-cruise-2027"), listAdvisorAlerts(), getTripInquiries()]);
    return { deals, experiences, proposals, responses, grimsleyExperience, grimsleyProfile, alerts, websiteInquiries };
  }),
  markAlertRead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await markAdvisorAlertRead(input.id);
    return { success: true };
  }),
  deletePublicInquiry: adminProcedure.input(z.object({ id: z.number().int().positive(), confirmation: z.literal("DELETE") })).mutation(async ({ input }) => {
    const deleted = await deletePublicWebsiteInquiry(input.id);
    return { success: true, inquiryId: deleted.inquiryId, deletedDealCount: deleted.deletedDealIds.length };
  }),
  createDeal: adminProcedure.input(z.object({
    contactFirstName: z.string().trim().min(2).max(80), contactLastName: z.string().trim().min(2).max(80), email: z.string().trim().email().max(320), phone: z.string().trim().min(7).max(40), title: z.string().trim().min(3).max(180), travelSummary: z.string().trim().max(4000).optional().default(""), nextAction: z.string().trim().max(1000).optional().default(""), meetingAt: z.string().trim().max(32).optional().default(""), meetingNotes: z.string().trim().max(2000).optional().default(""), experienceId: z.number().int().positive().optional(),
  })).mutation(async ({ input }) => {
    const deal = await createAdvisorDeal({ ...input, meetingAt: input.meetingAt ? new Date(input.meetingAt) : undefined, sourceType: "manual", stage: "new_inquiry" });
    return { success: true, dealId: deal.id };
  }),
  createExperience: adminProcedure.input(z.object({
    slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string().trim().min(3).max(180), groupName: z.string().trim().max(180).optional().default(""), cruiseLine: z.string().trim().min(2).max(120), shipName: z.string().trim().min(2).max(160), embarkPort: z.string().trim().min(2).max(160), sailingSummary: z.string().trim().min(2).max(180), heroImageUrl: z.string().trim().url().optional().or(z.literal("")).default(""), heroImageAlt: z.string().trim().max(240).optional().default(""), publicSummary: z.string().trim().max(4000).optional().default(""), roomGuidance: z.string().trim().max(4000).optional().default(""), shipFactsJson: z.string().trim().max(6000).optional().default(""), cabinCategoriesJson: z.string().trim().max(6000).optional().default(""), amenitiesJson: z.string().trim().max(6000).optional().default(""), sourceReference: z.string().trim().url().optional().or(z.literal("")).default(""), reviewedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")).default(""), status: z.enum(["draft", "ready", "archived"]).default("draft"),
  })).mutation(async ({ input }) => {
    const experience = await createCruiseExperience(input);
    return { success: true, experienceId: experience.id };
  }),
  uploadExperienceImage: adminProcedure.input(z.object({ dataUrl: z.string().min(32).max(7_000_000) })).mutation(async ({ input }) => {
    const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error("Please upload a JPG, PNG, or WebP image.");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 5 * 1024 * 1024) throw new Error("Please use an image smaller than 5 MB.");
    const extension = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
    const stored = await storagePut(`cruise-experiences/${Date.now()}.${extension}`, bytes, match[1]);
    return { url: stored.url };
  }),
  updateDeal: adminProcedure.input(z.object({ id: z.number().int().positive(), stage: z.enum(dealStages), experienceId: z.number().int().positive().optional(), nextAction: z.string().trim().max(1000).optional().default(""), meetingAt: z.string().trim().max(32).optional().default(""), meetingNotes: z.string().trim().max(2000).optional().default(""), advisorNotes: z.string().trim().max(5000).optional().default(""), reservationReference: z.string().trim().max(160).optional().default("") })).mutation(async ({ input }) => {
    await updateAdvisorDeal(input.id, { ...input, meetingAt: input.meetingAt ? new Date(input.meetingAt) : undefined });
    return { success: true };
  }),
  continueDealStage: adminProcedure.input(z.object({ id: z.number().int().positive(), nextAction: z.string().trim().max(1000).optional().default(""), meetingAt: z.string().trim().max(32).optional().default(""), meetingNotes: z.string().trim().max(5000).optional().default(""), advisorNotes: z.string().trim().max(5000).optional().default(""), reservationReference: z.string().trim().max(160).optional().default(""), experienceId: z.number().int().positive().optional(), stageData: z.record(z.string(), z.string().trim().max(1600)).optional().default({}) })).mutation(async ({ ctx, input }) => {
    const updated = await advanceAdvisorDealWorkflow(input.id, ctx.user.id, { ...input, meetingAt: input.meetingAt ? new Date(input.meetingAt) : undefined });
    return { success: true, stage: updated.stage };
  }),
  reopenDealStage: adminProcedure.input(z.object({ id: z.number().int().positive(), stage: z.enum(dealStages), reason: z.string().trim().min(6).max(1000) })).mutation(async ({ ctx, input }) => {
    await reopenAdvisorDealWorkflow(input.id, ctx.user.id, input.stage, input.reason);
    return { success: true };
  }),
  dealHistory: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => listWorkflowStageEvents("deal", input.id)),
  createProposal: adminProcedure.input(z.object({ dealId: z.number().int().positive(), experienceId: z.number().int().positive().optional(), title: z.string().trim().min(3).max(180), summary: z.string().trim().max(5000).optional().default(""), roomGuidance: z.string().trim().max(5000).optional().default(""), pricingSummary: z.string().trim().max(5000).optional().default(""), validForDays: z.number().int().min(1).max(180).default(30) })).mutation(async ({ input }) => {
    const privateToken = randomBytes(32).toString("base64url");
    const proposal = await createClientProposal({ ...input, privateToken, expiresAt: new Date(Date.now() + input.validForDays * 24 * 60 * 60 * 1000) });
    return { success: true, proposalId: proposal.id, privateToken };
  }),
  markProposalShared: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await markClientProposalShared(input.id);
    return { success: true };
  }),
  updateProposalResponse: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "reviewed", "quoted", "closed"]) })).mutation(async ({ input }) => {
    await updateProposalResponseStatus(input.id, input.status);
    return { success: true };
  }),
  updateGroupProfile: adminProcedure.input(z.object({
    id: z.number().int().positive(),
    stage: z.enum(groupProfileStages),
    shareStatus: z.enum(groupShareStatuses),
    coordinatorName: z.string().trim().max(160).optional().default(""),
    coordinatorEmail: z.string().trim().max(320).optional().default(""),
    coordinatorPhone: z.string().trim().max(40).optional().default(""),
    experienceId: z.number().int().positive().optional(),
    groupTerms: z.string().trim().max(5000).optional().default(""),
    roomStrategy: z.string().trim().max(5000).optional().default(""),
    bookingWindow: z.string().trim().max(1000).optional().default(""),
    advisorNotes: z.string().trim().max(5000).optional().default(""),
  })).mutation(async ({ input }) => {
    await updateGroupTravelProfile(input.id, input);
    return { success: true };
  }),
  saveGroupWorkflow: adminProcedure.input(z.object({ id: z.number().int().positive(), experienceId: z.number().int().positive().optional(), coordinatorName: z.string().trim().max(160).optional().default(""), coordinatorEmail: z.string().trim().max(320).optional().default(""), coordinatorPhone: z.string().trim().max(40).optional().default(""), groupTerms: z.string().trim().max(5000).optional().default(""), roomStrategy: z.string().trim().max(5000).optional().default(""), bookingWindow: z.string().trim().max(1000).optional().default(""), advisorNotes: z.string().trim().max(5000).optional().default("") })).mutation(async ({ input }) => {
    await saveGroupWorkflowDetails(input.id, input);
    return { success: true };
  }),
  continueGroupStage: adminProcedure.input(z.object({ id: z.number().int().positive(), nextAction: z.string().trim().max(1000).optional().default(""), meetingAt: z.string().trim().max(32).optional().default(""), meetingNotes: z.string().trim().max(5000).optional().default(""), reservationReference: z.string().trim().max(160).optional().default(""), experienceId: z.number().int().positive().optional(), stageData: z.record(z.string(), z.string().trim().max(1600)).optional().default({}) })).mutation(async ({ ctx, input }) => {
    const updated = await advanceGroupWorkflow(input.id, ctx.user.id, { ...input, meetingAt: input.meetingAt ? new Date(input.meetingAt) : undefined });
    return { success: true, stage: updated.workflowStage };
  }),
  reopenGroupStage: adminProcedure.input(z.object({ id: z.number().int().positive(), stage: z.enum(dealStages), reason: z.string().trim().min(6).max(1000) })).mutation(async ({ ctx, input }) => {
    await reopenGroupWorkflow(input.id, ctx.user.id, input.stage, input.reason);
    return { success: true };
  }),
  groupHistory: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => listWorkflowStageEvents("group", input.id)),
  shareGroupProfile: adminProcedure.input(z.object({ id: z.number().int().positive(), validForDays: z.number().int().min(1).max(180).default(30) })).mutation(async ({ ctx, input }) => {
    const profile = await shareGroupTravelProfile(input.id, input.validForDays, ctx.user.id);
    return { success: true, privateToken: profile.privateToken, expiresAt: profile.expiresAt };
  }),
  getPrivateProposal: publicProcedure.input(z.object({ token: z.string().trim().min(32).max(96) })).query(({ input }) => getPrivateClientProposal(input.token)),
  getPrivateGroupProfile: publicProcedure.input(z.object({ token: z.string().trim().min(32).max(96) })).query(({ input }) => getPrivateGroupTravelProfile(input.token)),
  submitProposalResponse: publicProcedure.input(z.object({
    token: z.string().trim().min(32).max(96), contactFirstName: z.string().trim().min(2).max(80), contactLastName: z.string().trim().min(2).max(80), email: z.string().trim().email().max(320), phone: z.string().trim().min(7).max(40), rooms: z.array(roomInput).min(1).max(12), notes: z.string().trim().max(2000).optional().default(""), consent: z.literal(true),
  })).mutation(async ({ input }) => {
    const privateProposal = await getPrivateClientProposal(input.token);
    if (!privateProposal) return { success: false, unavailable: true };
    const response = await createProposalResponse({ proposalId: privateProposal.proposal.id, contactFirstName: input.contactFirstName, contactLastName: input.contactLastName, email: input.email, phone: input.phone, roomsJson: JSON.stringify(input.rooms), notes: input.notes });
    const travelerCount = input.rooms.reduce((total, room) => total + room.travelerDetails.length, 0);
    const [ownerNotificationSent, portalAlertStored] = await Promise.all([
      notifyWendy("New proposal response · The Wendy Collective", [`${input.contactFirstName} ${input.contactLastName} responded to ${privateProposal.proposal.title}.`, `Email: ${input.email}`, `Rooms: ${input.rooms.length}`, `Travelers: ${travelerCount}`, "Open Wendy’s workspace to review the request and prepare the live quote."].join("\n")),
      createAdvisorAlert({ sourceType: "proposal_response", sourceId: response.id, title: `New response to ${privateProposal.proposal.title}`, detail: `${input.contactFirstName} ${input.contactLastName} submitted ${input.rooms.length} room${input.rooms.length === 1 ? "" : "s"} for ${travelerCount} traveler${travelerCount === 1 ? "" : "s"}.`, href: "/wendy/proposals" }).then(() => true).catch((error) => { console.error("[CRM] Proposal response alert failed", { responseId: response.id, error }); return false; }),
    ]);
    return { success: true, responseId: response.id, ownerNotificationSent, portalAlertStored, unavailable: false };
  }),
});
