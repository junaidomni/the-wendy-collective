import { afterEach, describe, expect, it, vi } from "vitest";
import { isResendConfigured, sendGroupCabinRequestEmail, sendTripBriefEmail } from "./resendAlerts";

const sample = { inquiryId: 14, firstName: "Avery", lastName: "Lane", email: "avery@example.com", phone: "555-010-1234", travelType: "groupTravel", destinations: ["Mexico"], travelTiming: "November 2026", dateFlexibility: "flexible", budget: "$6,000", groupSize: 2, priorities: "A quiet celebration." };

const configuredRecipient = process.env.RESEND_ALERT_RECIPIENT;
afterEach(() => { delete process.env.RESEND_API_KEY; delete process.env.RESEND_FROM_EMAIL; if (configuredRecipient) process.env.RESEND_ALERT_RECIPIENT = configuredRecipient; else delete process.env.RESEND_ALERT_RECIPIENT; vi.unstubAllGlobals(); });

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

  it("prepares a complete, privacy-safe Grimsley request alert when delivery is activated", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "The Wendy Collective <hello@example.com>";
    process.env.RESEND_ALERT_RECIPIENT = "info@thewendycollective.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendGroupCabinRequestEmail({ requestId: 43, revisionNumber: 2, contactFirstName: "Avery", contactLastName: "Lane", email: "avery@example.com", phone: "555-010-1234", notes: "Prefer a quiet cabin near the middle of the ship.", amenities: ["wifi", "specialty_dining"], extras: { wifiPlan: "Premium", wifiUsers: 2, diningExperience: "JiJi Asian Kitchen", diningAdults: 2, diningChildren: 0, diningTotalCents: 8400, rateQualifiers: ["senior_55_plus"] }, estimate: { cabinTotalCents: 137800, extrasTotalCents: 8400, tripTotalCents: 146200, depositCents: 10000, onboardCreditCents: 0 }, rooms: [{ occupancy: 2, roomType: "interior", locationPreference: "midship", selectedCabinCategory: "Deck 10 Interior", estimatedFareCents: 137800, estimatedGratuitiesCents: 0, estimatedProtectionCents: 0, travelers: [{ firstName: "Avery", lastName: "Lane", age: 18, dateOfBirth: "2008-04-12", loyaltyNumber: "CCL 123" }, { firstName: "Jordan", lastName: "Lane", age: 18 }] }] })).resolves.toBe("sent");
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload).toMatchObject({ to: ["info@thewendycollective.com"], reply_to: "avery@example.com", subject: "New Grimsley cabin request from Avery Lane" });
    expect(payload.text).toContain("Deck 10 Interior");
    expect(payload.text).toContain("date of birth 2008-04-12");
    expect(payload.html).toContain("JiJi Asian Kitchen");
    expect(payload.html).toContain("Do not reply with payment, passport, password, or supplier-account information.");
    expect(payload.html).not.toContain("4111 1111 1111 1111");
    expect(payload.html).not.toContain("P123456789");
  });
});
