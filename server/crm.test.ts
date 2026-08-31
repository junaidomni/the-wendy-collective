import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ advanceAdvisorDealWorkflow: vi.fn(), advanceGroupWorkflow: vi.fn(), createAdvisorAlert: vi.fn(), createAdvisorAvailabilityBlock: vi.fn(), createAdvisorDeal: vi.fn(), createClientProposal: vi.fn(), createProposalResponse: vi.fn(), deleteAdvisorAvailabilityBlock: vi.fn(), deletePublicWebsiteInquiry: vi.fn(), ensureGrimsleyCruiseExperience: vi.fn(), ensureGrimsleyGroupProfile: vi.fn(), getGroupTravelProfile: vi.fn(), getPrivateClientProposal: vi.fn(), getPrivateGroupTravelProfile: vi.fn(), listAdvisorAlerts: vi.fn(), listAdvisorAppointments: vi.fn(), listAdvisorAvailabilityBlocks: vi.fn(), listAdvisorDeals: vi.fn(), listClientProposals: vi.fn(), listCruiseExperiences: vi.fn(), listProposalResponses: vi.fn(), listWorkflowStageEvents: vi.fn(), markAdvisorAlertRead: vi.fn(), markClientProposalShared: vi.fn(), reopenAdvisorDealWorkflow: vi.fn(), reopenGroupWorkflow: vi.fn(), saveGroupWorkflowDetails: vi.fn(), scheduleLocalDiscoveryAppointment: vi.fn(), shareGroupTravelProfile: vi.fn(), syncExistingRequestsToAdvisorDeals: vi.fn(), updateAdvisorDeal: vi.fn(), updateGroupTravelProfile: vi.fn(), updateProposalResponseStatus: vi.fn(), createCruiseExperience: vi.fn(), notifyOwner: vi.fn() }));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}

const owner = { id: 1, openId: "owner-1", email: "wendy@example.com", name: "Wendy Carter", loginMethod: "manus", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const token = "nO2cJ2DLexS4dd7zxjgTLRwODnP0CZ5oOQgZkpt4pWk";

describe("advisor CRM and private proposal workflow", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.createAdvisorDeal.mockResolvedValue({ id: 51 });
    mocks.createClientProposal.mockResolvedValue({ id: 73 });
    mocks.ensureGrimsleyCruiseExperience.mockResolvedValue({ id: 3, shipName: "Mardi Gras" });
    mocks.ensureGrimsleyGroupProfile.mockResolvedValue({ id: 9 });
    mocks.getGroupTravelProfile.mockResolvedValue({ profile: { id: 9, groupKey: "grimsley-hs-graduation-cruise-2027", stage: "proposal_build", shareStatus: "draft" }, experience: { shipName: "Mardi Gras" }, cabinRequests: [] });
    mocks.listAdvisorAlerts.mockResolvedValue([]); mocks.listAdvisorAppointments.mockResolvedValue([]); mocks.listAdvisorAvailabilityBlocks.mockResolvedValue([]); mocks.listAdvisorDeals.mockResolvedValue([]); mocks.listClientProposals.mockResolvedValue([]); mocks.listCruiseExperiences.mockResolvedValue([]); mocks.listProposalResponses.mockResolvedValue([]); mocks.advanceAdvisorDealWorkflow.mockResolvedValue({ stage: "discovery_call" }); mocks.advanceGroupWorkflow.mockResolvedValue({ workflowStage: "proposal_shared" }); mocks.listWorkflowStageEvents.mockResolvedValue([]); mocks.createAdvisorAlert.mockResolvedValue({ id: 92 }); mocks.markAdvisorAlertRead.mockResolvedValue(undefined); mocks.scheduleLocalDiscoveryAppointment.mockResolvedValue({ id: 151 }); mocks.createAdvisorAvailabilityBlock.mockResolvedValue({ id: 41 }); mocks.deleteAdvisorAvailabilityBlock.mockResolvedValue(undefined);
    mocks.notifyOwner.mockResolvedValue(true);
    mocks.deletePublicWebsiteInquiry.mockResolvedValue({ inquiryId: 41, deletedDealIds: [51] });
  });

  it("keeps CRM management private to Wendy", async () => {
    await expect(appRouter.createCaller(context()).crm.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const visitor = { ...owner, id: 7, openId: "visitor-7", role: "user" as const };
    await expect(appRouter.createCaller(context(visitor)).crm.createDeal({ contactFirstName: "Alex", contactLastName: "Morgan", email: "alex@example.com", phone: "555-010-1020", title: "Anniversary sailing" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets only Wendy permanently remove a confirmed public website inquiry", async () => {
    const visitor = { ...owner, id: 7, openId: "visitor-7", role: "user" as const };
    await expect(appRouter.createCaller(context(visitor)).crm.deletePublicInquiry({ id: 41, confirmation: "DELETE" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context(owner)).crm.deletePublicInquiry({ id: 41, confirmation: "DELETE" })).resolves.toMatchObject({ success: true, inquiryId: 41, deletedDealCount: 1 });
    expect(mocks.deletePublicWebsiteInquiry).toHaveBeenCalledWith(41);
  });

  it("prepares prior public requests for Wendy’s unified pipeline", async () => {
    mocks.syncExistingRequestsToAdvisorDeals.mockResolvedValue({ added: 2 });
    const dashboard = await appRouter.createCaller(context(owner)).crm.dashboard();
    expect(mocks.syncExistingRequestsToAdvisorDeals).toHaveBeenCalledTimes(1);
    expect(dashboard.grimsleyExperience).toMatchObject({ shipName: "Mardi Gras" });
    expect(dashboard.grimsleyProfile).toMatchObject({ profile: { groupKey: "grimsley-hs-graduation-cruise-2027" } });
    expect(dashboard.alerts).toEqual([]);
  });

  it("keeps source-specific portal alerts inside Wendy’s protected workspace", async () => {
    const caller = appRouter.createCaller(context(owner));
    await caller.crm.markAlertRead({ id: 92 });
    expect(mocks.markAdvisorAlertRead).toHaveBeenCalledWith(92);
    await expect(appRouter.createCaller(context()).crm.markAlertRead({ id: 92 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps Grimsley stage controls and family-link sharing private to Wendy", async () => {
    const caller = appRouter.createCaller(context(owner));
    await caller.crm.updateGroupProfile({ id: 9, stage: "ready_to_share", shareStatus: "draft", groupTerms: "Wendy confirms every live quote." });
    expect(mocks.updateGroupTravelProfile).toHaveBeenCalledWith(9, expect.objectContaining({ stage: "ready_to_share", shareStatus: "draft" }));
    mocks.shareGroupTravelProfile.mockResolvedValue({ privateToken: token, expiresAt: new Date("2026-09-30") });
    const shared = await caller.crm.shareGroupProfile({ id: 9, validForDays: 30 });
    expect(shared.privateToken).toBe(token);
    expect(mocks.shareGroupTravelProfile).toHaveBeenCalledWith(9, 30, owner.id);
    await expect(appRouter.createCaller(context()).crm.shareGroupProfile({ id: 9, validForDays: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns a private Grimsley profile only through a valid active link", async () => {
    const privateProfile = { profile: { groupKey: "grimsley-hs-graduation-cruise-2027", shareStatus: "shared" }, experience: { shipName: "Mardi Gras" } };
    mocks.getPrivateGroupTravelProfile.mockResolvedValue(privateProfile);
    await expect(appRouter.createCaller(context()).crm.getPrivateGroupProfile({ token })).resolves.toEqual(privateProfile);
    expect(mocks.getPrivateGroupTravelProfile).toHaveBeenCalledWith(token);
  });

  it("creates an advisor deal and produces a high-entropy private proposal token", async () => {
    const caller = appRouter.createCaller(context(owner));
    await caller.crm.createDeal({ contactFirstName: "Alex", contactLastName: "Morgan", email: "alex@example.com", phone: "555-010-1020", title: "Anniversary sailing", travelSummary: "A quiet coastal celebration", nextAction: "Schedule discovery call" });
    expect(mocks.createAdvisorDeal).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "manual", stage: "new_inquiry", contactFirstName: "Alex" }));
    const proposal = await caller.crm.createProposal({ dealId: 51, title: "A considered sailing", validForDays: 30 });
    expect(proposal.privateToken).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(mocks.createClientProposal).toHaveBeenCalledWith(expect.objectContaining({ dealId: 51, privateToken: proposal.privateToken, expiresAt: expect.any(Date) }));
  });

  it("stores a scheduled discovery appointment and agenda inside Wendy’s CRM", async () => {
    const caller = appRouter.createCaller(context(owner));
    await caller.crm.updateDeal({ id: 51, stage: "discovery_call", meetingAt: "2026-09-02T14:30", meetingNotes: "Review summer dates, balcony options, and budget.", nextAction: "Call client" });
    expect(mocks.updateAdvisorDeal).toHaveBeenCalledWith(51, expect.objectContaining({ stage: "discovery_call", meetingAt: expect.any(Date), meetingNotes: "Review summer dates, balcony options, and budget." }));
  });

  it("stores discovery scheduling locally and keeps Google Calendar and Meet inactive", async () => {
    const result = await appRouter.createCaller(context(owner)).crm.scheduleDiscoveryAppointment({ dealId: 51, title: "Discovery call with Alex Morgan", startsAt: "2026-09-02T14:30:00.000Z", durationMinutes: 30, attendeeName: "Alex Morgan", attendeeEmail: "alex@example.com", attendeePhone: "555-010-1020", clientMessage: "Looking forward to connecting.", advisorNotes: "First call completed.", nextAction: "Prepare tailored recommendations after discovery" });
    expect(result).toEqual({ success: true, appointmentId: 151, calendarSyncStatus: "not_connected" });
    expect(mocks.scheduleLocalDiscoveryAppointment).toHaveBeenCalledWith(expect.objectContaining({ dealId: 51, startsAt: expect.any(Date), actorUserId: owner.id }));
    await expect(appRouter.createCaller(context()).crm.scheduleDiscoveryAppointment({ dealId: 51, title: "Discovery call", startsAt: "2026-09-02T14:30:00.000Z", durationMinutes: 30, attendeeName: "Alex Morgan", attendeeEmail: "alex@example.com" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets Wendy save and remove local availability blocks without creating external calendar events", async () => {
    const caller = appRouter.createCaller(context(owner));
    await expect(caller.crm.createAvailabilityBlock({ title: "Personal commitment", startsAt: "2026-09-03T14:00:00.000Z", endsAt: "2026-09-03T15:00:00.000Z", status: "unavailable", notes: "Unavailable for calls" })).resolves.toEqual({ success: true, availabilityBlockId: 41 });
    expect(mocks.createAdvisorAvailabilityBlock).toHaveBeenCalledWith(expect.objectContaining({ status: "unavailable", startsAt: expect.any(Date), endsAt: expect.any(Date) }));
    await caller.crm.deleteAvailabilityBlock({ id: 41 });
    expect(mocks.deleteAdvisorAvailabilityBlock).toHaveBeenCalledWith(41);
  });

  it("moves a client forward through Wendy’s protected stage action and uses the workflow layer", async () => {
    const result = await appRouter.createCaller(context(owner)).crm.continueDealStage({ id: 51, nextAction: "Prepare discovery agenda", meetingAt: "2026-09-02T14:30", stageData: { firstResponse: "Client prefers a balcony." } });
    expect(result).toEqual({ success: true, stage: "discovery_call" });
    expect(mocks.advanceAdvisorDealWorkflow).toHaveBeenCalledWith(51, owner.id, expect.objectContaining({ nextAction: "Prepare discovery agenda", meetingAt: expect.any(Date), stageData: { firstResponse: "Client prefers a balcony." } }));
    await expect(appRouter.createCaller(context()).crm.continueDealStage({ id: 51 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps reopen, group stage, and group history controls inside Wendy’s protected workflow", async () => {
    const caller = appRouter.createCaller(context(owner));
    await caller.crm.reopenDealStage({ id: 51, stage: "discovery_call", reason: "The client changed travel dates." });
    expect(mocks.reopenAdvisorDealWorkflow).toHaveBeenCalledWith(51, owner.id, "discovery_call", "The client changed travel dates.");
    await caller.crm.continueGroupStage({ id: 9, experienceId: 3, stageData: { proposalTitle: "Mardi Gras group proposal" } });
    expect(mocks.advanceGroupWorkflow).toHaveBeenCalledWith(9, owner.id, expect.objectContaining({ experienceId: 3 }));
    await caller.crm.groupHistory({ id: 9 });
    expect(mocks.listWorkflowStageEvents).toHaveBeenCalledWith("group", 9);
  });

  it("allows a client to respond only through a valid private link and alerts Wendy", async () => {
    mocks.getPrivateClientProposal.mockResolvedValue({ proposal: { id: 73, title: "A considered sailing" } });
    mocks.createProposalResponse.mockResolvedValue({ id: 84 });
    const result = await appRouter.createCaller(context()).crm.submitProposalResponse({ token, contactFirstName: "Alex", contactLastName: "Morgan", email: "alex@example.com", phone: "555-010-1020", consent: true, rooms: [{ occupancy: 2, roomType: "Balcony", locationPreference: "Mid ship", travelerDetails: [{ fullName: "Alex Morgan", dateOfBirth: "1985-03-10" }, { fullName: "Riley Morgan", dateOfBirth: "1986-08-20" }] }] });
    expect(result).toEqual({ success: true, responseId: 84, ownerNotificationSent: true, portalAlertStored: true, unavailable: false });
    expect(mocks.createProposalResponse).toHaveBeenCalledWith(expect.objectContaining({ proposalId: 73, roomsJson: expect.stringContaining("1985-03-10") }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New proposal response · The Wendy Collective", content: expect.stringContaining("Travelers: 2") }));
    expect(mocks.createAdvisorAlert).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "proposal_response", sourceId: 84, href: "/wendy/proposals" }));
  });

  it("does not accept a client response for an expired or missing private proposal", async () => {
    mocks.getPrivateClientProposal.mockResolvedValue(undefined);
    const result = await appRouter.createCaller(context()).crm.submitProposalResponse({ token, contactFirstName: "Alex", contactLastName: "Morgan", email: "alex@example.com", phone: "555-010-1020", consent: true, rooms: [{ occupancy: 1, roomType: "Interior", locationPreference: "No preference", travelerDetails: [{ fullName: "Alex Morgan", dateOfBirth: "1985-03-10" }] }] });
    expect(result).toEqual({ success: false, unavailable: true });
    expect(mocks.createProposalResponse).not.toHaveBeenCalled();
  });

  it("lets Wendy progress a private proposal response without exposing the control publicly", async () => {
    await appRouter.createCaller(context(owner)).crm.updateProposalResponse({ id: 84, status: "quoted" });
    expect(mocks.updateProposalResponseStatus).toHaveBeenCalledWith(84, "quoted");
    await expect(appRouter.createCaller(context()).crm.updateProposalResponse({ id: 84, status: "quoted" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
