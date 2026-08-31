import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createFamilyPortalCabinRequest: vi.fn(), createFamilyPortalRevision: vi.fn(), createAdvisorAlert: vi.fn(), deleteGroupCabinRequestHousehold: vi.fn(), getGroupCabinRequests: vi.fn(), getPrivateFamilyPortal: vi.fn(), updateGroupCabinRequestStatus: vi.fn(), notifyOwner: vi.fn(), sendGroupCabinRequestEmail: vi.fn() }));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), createFamilyPortalCabinRequest: mocks.createFamilyPortalCabinRequest, createFamilyPortalRevision: mocks.createFamilyPortalRevision, createAdvisorAlert: mocks.createAdvisorAlert, deleteGroupCabinRequestHousehold: mocks.deleteGroupCabinRequestHousehold, getGroupCabinRequests: mocks.getGroupCabinRequests, getPrivateFamilyPortal: mocks.getPrivateFamilyPortal, updateGroupCabinRequestStatus: mocks.updateGroupCabinRequestStatus }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));
vi.mock("./resendAlerts", async (importOriginal) => ({ ...(await importOriginal<typeof import("./resendAlerts")>()), sendGroupCabinRequestEmail: mocks.sendGroupCabinRequestEmail }));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}

const owner = { id: 1, openId: "owner-1", email: "wendy@example.com", name: "Wendy Carter", loginMethod: "manus", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const request = {
  groupKey: "grimsley-hs-graduation-cruise-2027" as const,
  contactFirstName: "Morgan",
  contactLastName: "Taylor",
  email: "morgan@example.com",
  phone: "555-010-1234",
  notes: "One room close to family if possible.",
  amenities: ["wifi", "travel_protection"] as const,
  extras: { wifiPlan: "Premium", wifiUsers: 2, cheersAdults: 1, diningExperience: "Fahrenheit 555 Steakhouse", diningAdults: 2, diningChildren: 0, diningTotalCents: 10400, rateQualifiers: ["military"] as const },
  estimate: { cabinTotalCents: 223400, extrasTotalCents: 28794, tripTotalCents: 252194, depositCents: 10000, onboardCreditCents: 0 },
  consent: true as const,
  rooms: [{ occupancy: 2 as const, roomType: "balcony" as const, locationPreference: "midship" as const, selectedCabinCategory: "Standard Balcony, Deck 9 location", estimatedFareCents: 185800, estimatedGratuitiesCents: 13600, estimatedProtectionCents: 22000, travelers: [{ firstName: "Morgan", middleName: "", lastName: "Taylor", age: 18, dateOfBirth: "2008-06-24", loyaltyNumber: "" }, { firstName: "Robin", middleName: "A", lastName: "Taylor", age: 47, dateOfBirth: "1979-04-12", loyaltyNumber: "VIFP-001" }] }],
};

describe("group cabin request workflow", () => {
  beforeEach(() => { mocks.createFamilyPortalCabinRequest.mockReset(); mocks.createFamilyPortalRevision.mockReset(); mocks.createAdvisorAlert.mockReset(); mocks.deleteGroupCabinRequestHousehold.mockReset(); mocks.getGroupCabinRequests.mockReset(); mocks.getPrivateFamilyPortal.mockReset(); mocks.updateGroupCabinRequestStatus.mockReset(); mocks.notifyOwner.mockReset(); mocks.sendGroupCabinRequestEmail.mockReset(); mocks.createFamilyPortalCabinRequest.mockResolvedValue({ id: 28, familyPortalToken: "f".repeat(43), revisionNumber: 1 }); mocks.createAdvisorAlert.mockResolvedValue({ id: 38 }); mocks.deleteGroupCabinRequestHousehold.mockResolvedValue({ deletedRequestIds: [28, 29], groupKey: request.groupKey }); mocks.getGroupCabinRequests.mockResolvedValue([]); mocks.getPrivateFamilyPortal.mockResolvedValue({ profile: { groupKey: "grimsley-hs-graduation-cruise-2027" } }); mocks.notifyOwner.mockResolvedValue(true); mocks.sendGroupCabinRequestEmail.mockResolvedValue("not_configured"); });

  it("stores room and traveler details then alerts Wendy without payment or passport fields", async () => {
    const result = await appRouter.createCaller(context()).groupCruises.createCabinRequest(request);
    expect(result).toEqual({ success: true, requestId: 28, familyPortalToken: "f".repeat(43), revisionNumber: 1, ownerNotificationSent: true, emailAlertStatus: "not_configured", portalAlertStored: true });
    expect(mocks.createFamilyPortalCabinRequest).toHaveBeenCalledWith(expect.objectContaining({ groupKey: request.groupKey, amenities: ["wifi", "travel_protection"], extras: expect.objectContaining({ wifiPlan: "Premium", diningExperience: "Fahrenheit 555 Steakhouse", diningTotalCents: 10400, rateQualifiers: ["military"] }), estimate: expect.objectContaining({ tripTotalCents: 252194 }), rooms: expect.arrayContaining([expect.objectContaining({ locationPreference: "midship", selectedCabinCategory: "Standard Balcony, Deck 9 location", estimatedFareCents: 185800, travelers: expect.arrayContaining([expect.objectContaining({ firstName: "Morgan", age: 18, dateOfBirth: "2008-06-24" })]) })]) }));
    expect(mocks.createFamilyPortalCabinRequest.mock.calls[0][0]).not.toHaveProperty("passportNumber");
    expect(mocks.createFamilyPortalCabinRequest.mock.calls[0][0]).not.toHaveProperty("paymentCard");
    expect(mocks.createAdvisorAlert).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "group_request", sourceId: 28, groupKey: request.groupKey, href: "/wendy/groups/grimsley" }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New Grimsley cabin request · The Wendy Collective", content: expect.stringContaining("Rooms requested: 1") }));
    expect(mocks.sendGroupCabinRequestEmail).toHaveBeenCalledWith(expect.objectContaining({ requestId: 28, revisionNumber: 1, notes: request.notes, amenities: request.amenities, extras: expect.objectContaining({ diningExperience: "Fahrenheit 555 Steakhouse" }), estimate: expect.objectContaining({ tripTotalCents: 252194 }), rooms: expect.arrayContaining([expect.objectContaining({ occupancy: 2, travelers: expect.arrayContaining([expect.objectContaining({ dateOfBirth: "2008-06-24" })]) })]) }));
  });

  it("adds a numbered current revision to the authenticated household portal without creating a pipeline record", async () => {
    const familyPortalToken = "u".repeat(43);
    mocks.createFamilyPortalRevision.mockResolvedValue({ id: 29, familyPortalToken, revisionNumber: 2 });
    const result = await appRouter.createCaller(context()).groupCruises.createCabinRequest({ ...request, familyPortalToken });
    expect(result).toMatchObject({ success: true, requestId: 29, familyPortalToken, revisionNumber: 2 });
    expect(mocks.createFamilyPortalRevision).toHaveBeenCalledWith(familyPortalToken, expect.objectContaining({ groupKey: request.groupKey, contactFirstName: "Morgan" }));
    expect(mocks.createAdvisorAlert).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "group_request", sourceId: 29 }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated Grimsley cabin request · The Wendy Collective" }));
  });

  it("rejects a room whose traveler count does not match its selected occupancy", async () => {
    const invalid = { ...request, rooms: [{ ...request.rooms[0], occupancy: 3 as const }] };
    await expect(appRouter.createCaller(context()).groupCruises.createCabinRequest(invalid)).rejects.toThrow("Each room must include the selected number of travelers.");
  });

  it("limits cabin-request review and status changes to Wendy", async () => {
    const visitor = { ...owner, id: 8, openId: "visitor-8", role: "user" as const };
    await expect(appRouter.createCaller(context(visitor)).groupCruises.listCabinRequests()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await appRouter.createCaller(context(owner)).groupCruises.updateCabinRequestStatus({ id: 28, status: "quote_in_progress", advisorNotes: "Checking live availability." });
    expect(mocks.updateGroupCabinRequestStatus).toHaveBeenCalledWith(28, "quote_in_progress", "Checking live availability.");
  });

  it("requires Wendy and an explicit confirmation before deleting only the selected household", async () => {
    const visitor = { ...owner, id: 8, openId: "visitor-8", role: "user" as const };
    await expect(appRouter.createCaller(context(visitor)).groupCruises.deleteCabinRequestHousehold({ id: 28, confirmation: "DELETE" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context(owner)).groupCruises.deleteCabinRequestHousehold({ id: 28, confirmation: "DELETE" })).resolves.toMatchObject({ success: true, deletedCount: 2, groupKey: request.groupKey });
    expect(mocks.deleteGroupCabinRequestHousehold).toHaveBeenCalledWith(28);
    await expect(appRouter.createCaller(context(owner)).groupCruises.deleteCabinRequestHousehold({ id: 28, confirmation: "DELETE" as never })).resolves.toMatchObject({ success: true });
  });
});
