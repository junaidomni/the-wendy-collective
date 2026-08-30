import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createGroupCabinRequest: vi.fn(), createAdvisorDeal: vi.fn(), getGroupCabinRequests: vi.fn(), updateGroupCabinRequestStatus: vi.fn(), notifyOwner: vi.fn(), sendGroupCabinRequestEmail: vi.fn() }));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), createGroupCabinRequest: mocks.createGroupCabinRequest, createAdvisorDeal: mocks.createAdvisorDeal, getGroupCabinRequests: mocks.getGroupCabinRequests, updateGroupCabinRequestStatus: mocks.updateGroupCabinRequestStatus }));
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
  consent: true as const,
  rooms: [{ occupancy: 2 as const, roomType: "balcony" as const, locationPreference: "midship" as const, travelers: [{ firstName: "Morgan", middleName: "", lastName: "Taylor", age: 18, dateOfBirth: "2008-06-24", loyaltyNumber: "" }, { firstName: "Robin", middleName: "A", lastName: "Taylor", age: 47, dateOfBirth: "1979-04-12", loyaltyNumber: "VIFP-001" }] }],
};

describe("group cabin request workflow", () => {
  beforeEach(() => { mocks.createGroupCabinRequest.mockReset(); mocks.createAdvisorDeal.mockReset(); mocks.getGroupCabinRequests.mockReset(); mocks.updateGroupCabinRequestStatus.mockReset(); mocks.notifyOwner.mockReset(); mocks.sendGroupCabinRequestEmail.mockReset(); mocks.createGroupCabinRequest.mockResolvedValue({ id: 28 }); mocks.createAdvisorDeal.mockResolvedValue({ id: 38 }); mocks.getGroupCabinRequests.mockResolvedValue([]); mocks.notifyOwner.mockResolvedValue(true); mocks.sendGroupCabinRequestEmail.mockResolvedValue("not_configured"); });

  it("stores room and traveler details then alerts Wendy without payment or passport fields", async () => {
    const result = await appRouter.createCaller(context()).groupCruises.createCabinRequest(request);
    expect(result).toEqual({ success: true, requestId: 28, ownerNotificationSent: true, emailAlertStatus: "not_configured" });
    expect(mocks.createGroupCabinRequest).toHaveBeenCalledWith(expect.objectContaining({ groupKey: request.groupKey, amenities: ["wifi", "travel_protection"], rooms: expect.arrayContaining([expect.objectContaining({ locationPreference: "midship", travelers: expect.arrayContaining([expect.objectContaining({ firstName: "Morgan", age: 18, dateOfBirth: "2008-06-24" })]) })]) }));
    expect(mocks.createAdvisorDeal).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "group_cabin_request", sourceId: 28, title: "Grimsley High School Graduation Cruise 2027", stage: "new_inquiry" }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New Grimsley cabin request · The Wendy Collective", content: expect.stringContaining("Rooms requested: 1") }));
    expect(mocks.sendGroupCabinRequestEmail).toHaveBeenCalledWith(expect.objectContaining({ requestId: 28, rooms: 1, travelers: 2 }));
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
});
