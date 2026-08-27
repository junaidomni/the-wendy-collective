export type TripBriefAlert = {
  inquiryId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  travelType: string;
  destinations: string[];
  travelTiming: string;
  dateFlexibility: string;
  budget: string;
  groupSize: number;
  priorities: string;
};

export type EmailAlertStatus = "sent" | "not_configured" | "failed";

const htmlEscape = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character] ?? character);

function getResendConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const recipient = process.env.RESEND_ALERT_RECIPIENT?.trim();
  return apiKey && from && recipient ? { apiKey, from, recipient } : null;
}

export function isResendConfigured() {
  return Boolean(getResendConfiguration());
}

function labelTravelType(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function textContent(input: TripBriefAlert) {
  return [
    `New trip brief from ${input.firstName} ${input.lastName}`,
    "",
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Travel style: ${labelTravelType(input.travelType)}`,
    `Destination interests: ${input.destinations.join(", ")}`,
    `Travel timing: ${input.travelTiming}`,
    `Date flexibility: ${input.dateFlexibility}`,
    `Budget: ${input.budget}`,
    `Travelers: ${input.groupSize}`,
    `Priorities: ${input.priorities || "Not provided"}`,
    "",
    "Open Wendy’s workspace to review the submitted trip brief.",
  ].join("\n");
}

function htmlContent(input: TripBriefAlert) {
  const rows = [
    ["Email", input.email], ["Phone", input.phone], ["Travel style", labelTravelType(input.travelType)],
    ["Destination interests", input.destinations.join(", ")], ["Travel timing", input.travelTiming],
    ["Date flexibility", input.dateFlexibility], ["Budget", input.budget], ["Travelers", String(input.groupSize)],
    ["Priorities", input.priorities || "Not provided"],
  ].map(([label, value]) => `<tr><td style="padding:11px 18px 11px 0;color:#6a716f;font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;vertical-align:top">${htmlEscape(label)}</td><td style="padding:11px 0;color:#0d1c22;font:15px Arial,sans-serif;line-height:1.55">${htmlEscape(value)}</td></tr>`).join("");

  return `<!doctype html><html><body style="margin:0;background:#edf0ed;padding:28px 12px"><main style="max-width:620px;margin:0 auto;background:#fffdf8;color:#0d1c22"><header style="padding:36px 38px;background:#0d1c22;color:#f6f2e9"><p style="margin:0 0 15px;color:#c4a26b;font:600 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">The Wendy Collective</p><h1 style="margin:0;font:500 32px Georgia,serif;line-height:1.1">A new trip brief is waiting.</h1></header><section style="padding:34px 38px"><p style="margin:0 0 26px;color:#425056;font:16px Arial,sans-serif;line-height:1.6">${htmlEscape(input.firstName)} ${htmlEscape(input.lastName)} has shared a new travel vision. The details are below.</p><table style="width:100%;border-collapse:collapse;border-top:1px solid #ded8cd">${rows}</table><p style="margin:28px 0 0;color:#59666a;font:13px Arial,sans-serif;line-height:1.6">Sign in to Wendy’s workspace to review and manage this trip brief.</p></section></main></body></html>`;
}

export async function sendTripBriefEmail(input: TripBriefAlert): Promise<EmailAlertStatus> {
  const config = getResendConfiguration();
  if (!config) return "not_configured";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `trip-brief/${input.inquiryId}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.recipient],
        reply_to: input.email,
        subject: `New trip brief from ${input.firstName} ${input.lastName}`,
        html: htmlContent(input),
        text: textContent(input),
        tags: [{ name: "category", value: "trip_brief" }, { name: "inquiry_id", value: String(input.inquiryId) }],
      }),
    });
    if (!response.ok) {
      console.error("[Resend] Trip brief email was not accepted", { status: response.status, inquiryId: input.inquiryId });
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[Resend] Trip brief email request failed", { inquiryId: input.inquiryId, error });
    return "failed";
  }
}
