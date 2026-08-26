import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createTripInquiry: vi.fn(), createPrivateClientRequest: vi.fn(), getPrivateClientRequests: vi.fn(), notifyOwner: vi.fn() }));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), createTripInquiry: mocks.createTripInquiry, createPrivateClientRequest: mocks.createPrivateClientRequest, getPrivateClientRequests: mocks.getPrivateClientRequests }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}

describe("trip inquiry workflow", () => {
  beforeEach(() => { mocks.createTripInquiry.mockReset(); mocks.createPrivateClientRequest.mockReset(); mocks.getPrivateClientRequests.mockReset(); mocks.notifyOwner.mockReset(); mocks.createTripInquiry.mockResolvedValue({ id: 17 }); mocks.createPrivateClientRequest.mockResolvedValue({ id: 18 }); mocks.getPrivateClientRequests.mockResolvedValue([]); mocks.notifyOwner.mockResolvedValue(true); });

  it("stores a public inquiry and notifies the owner with its travel details", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.inquiries.create({ firstName: "Avery", lastName: "Lane", email: "avery@example.com", phone: "555-010-1234", travelType: "cruise", destinations: ["Caribbean", "Aruba"], travelTiming: "November 2026", dateFlexibility: "flexible", budget: "$6,000–$8,000", groupSize: 2, priorities: "A quiet balcony and memorable shore days." });
    expect(result).toEqual({ success: true, inquiryId: 17, notificationSent: true });
    expect(mocks.createTripInquiry).toHaveBeenCalledWith(expect.objectContaining({ destinations: "[\"Caribbean\",\"Aruba\"]", groupSize: 2 }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New trip inquiry · The Wendy Collective", content: expect.stringContaining("Avery Lane") }));
  });

  it("keeps private experience details behind authenticated access", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.privateExperience.dashboard()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("records and alerts Wendy about an authenticated private-client request", async () => {
    const user = { id: 9, openId: "client-9", email: "client@example.com", name: "Jordan Ellis", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(context(user));
    const result = await caller.privateExperience.requestHelp({ requestType: "documents", message: "Could you resend the hotel confirmation when you have a moment?" });
    expect(result).toEqual({ success: true, requestId: 18 });
    expect(mocks.createPrivateClientRequest).toHaveBeenCalledWith({ userId: 9, requestType: "documents", message: "Could you resend the hotel confirmation when you have a moment?" });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "Private client request · The Wendy Collective", content: expect.stringContaining("Jordan Ellis") }));
  });
});
