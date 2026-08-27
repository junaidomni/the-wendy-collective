import { afterEach, describe, expect, it, vi } from "vitest";
import { isResendConfigured, sendTripBriefEmail } from "./resendAlerts";

const sample = { inquiryId: 14, firstName: "Avery", lastName: "Lane", email: "avery@example.com", phone: "555-010-1234", travelType: "groupTravel", destinations: ["Mexico"], travelTiming: "November 2026", dateFlexibility: "flexible", budget: "$6,000", groupSize: 2, priorities: "A quiet celebration." };

afterEach(() => { delete process.env.RESEND_API_KEY; delete process.env.RESEND_FROM_EMAIL; delete process.env.RESEND_ALERT_RECIPIENT; vi.unstubAllGlobals(); });

describe("Resend trip brief alerts", () => {
  it("stays inactive without the required production configuration", async () => {
    expect(isResendConfigured()).toBe(false);
    await expect(sendTripBriefEmail(sample)).resolves.toBe("not_configured");
  });

  it("sends a branded idempotent message after configuration", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "The Wendy Collective <hello@example.com>";
    process.env.RESEND_ALERT_RECIPIENT = "wendy@example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendTripBriefEmail(sample)).resolves.toBe("sent");
    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": "trip-brief/14" }) }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ to: ["wendy@example.com"], reply_to: "avery@example.com", subject: "New trip brief from Avery Lane" });
  });
});
