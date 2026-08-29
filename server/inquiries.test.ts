import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createTripInquiry: vi.fn(), createAdvisorDeal: vi.fn(), getTripInquiries: vi.fn(), notifyOwner: vi.fn(), sendTripBriefEmail: vi.fn() }));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), createTripInquiry: mocks.createTripInquiry, createAdvisorDeal: mocks.createAdvisorDeal, getTripInquiries: mocks.getTripInquiries }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));
vi.mock("./resendAlerts", () => ({ sendTripBriefEmail: mocks.sendTripBriefEmail }));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}

describe("trip inquiry workflow", () => {
  beforeEach(() => { mocks.createTripInquiry.mockReset(); mocks.createAdvisorDeal.mockReset(); mocks.getTripInquiries.mockReset(); mocks.notifyOwner.mockReset(); mocks.sendTripBriefEmail.mockReset(); mocks.createTripInquiry.mockResolvedValue({ id: 17 }); mocks.createAdvisorDeal.mockResolvedValue({ id: 27 }); mocks.getTripInquiries.mockResolvedValue([]); mocks.notifyOwner.mockResolvedValue(true); mocks.sendTripBriefEmail.mockResolvedValue("not_configured"); });

  it("stores a public inquiry and notifies the owner with its travel details", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.inquiries.create({ firstName: "Avery", lastName: "Lane", email: "avery@example.com", phone: "555-010-1234", travelType: "cruise", destinations: ["Caribbean", "Aruba"], travelTiming: "November 2026", dateFlexibility: "flexible", budget: "$6,000–$8,000", groupSize: 2, priorities: "A quiet balcony and memorable shore days." });
    expect(result).toEqual({ success: true, inquiryId: 17, ownerNotificationSent: true, emailAlertStatus: "not_configured" });
    expect(mocks.createTripInquiry).toHaveBeenCalledWith(expect.objectContaining({ destinations: "[\"Caribbean\",\"Aruba\"]", groupSize: 2 }));
    expect(mocks.createAdvisorDeal).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "trip_inquiry", sourceId: 17, stage: "new_inquiry", contactFirstName: "Avery" }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New trip inquiry · The Wendy Collective", content: expect.stringContaining("Avery Lane") }));
    expect(mocks.sendTripBriefEmail).toHaveBeenCalledWith(expect.objectContaining({ inquiryId: 17, email: "avery@example.com" }));
  });

  it("blocks anonymous visitors from the Wendy workspace", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.privateExperience.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks authenticated non-owners from Wendy’s inquiry workspace", async () => {
    const user = { id: 9, openId: "client-9", email: "client@example.com", name: "Jordan Ellis", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(context(user));
    await expect(caller.privateExperience.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("shows submitted trip briefs only to Wendy", async () => {
    const owner = { id: 1, openId: "owner-1", email: "wendy@example.com", name: "Wendy Carter", loginMethod: "manus", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    mocks.getTripInquiries.mockResolvedValue([{ id: 4, firstName: "Avery", lastName: "Lane", email: "avery@example.com", phone: "555-010-1234", travelType: "cruise", destinations: "[\"Caribbean\"]", travelTiming: "November 2026", dateFlexibility: "flexible", budget: "$6,000", groupSize: 2, priorities: "A quiet balcony", status: "new", createdAt: new Date() }]);
    const result = await appRouter.createCaller(context(owner)).privateExperience.dashboard();
    expect(result.firstName).toBe("Wendy");
    expect(result.inquiries).toHaveLength(1);
    expect(mocks.getTripInquiries).toHaveBeenCalledTimes(1);
  });
});
