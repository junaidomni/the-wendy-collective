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

export type GroupCabinRequestAlert = {
  requestId: number;
  revisionNumber: number;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  notes: string;
  amenities: string[];
  extras?: { wifiPlan?: string; wifiUsers?: number; cheersAdults?: number; diningExperience?: string; diningAdults?: number; diningChildren?: number; diningTotalCents?: number; rateQualifiers?: string[] };
  estimate?: { cabinTotalCents: number; extrasTotalCents: number; tripTotalCents: number; depositCents: number; onboardCreditCents: number };
  rooms: Array<{ occupancy: number; roomType: string; locationPreference: string; selectedCabinCategory?: string; estimatedFareCents?: number; estimatedGratuitiesCents?: number; estimatedProtectionCents?: number; travelers: Array<{ firstName: string; middleName?: string; lastName: string; age: number; dateOfBirth?: string; loyaltyNumber?: string }> }>;
};

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

const money = (cents?: number) => cents === undefined ? "Not calculated" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const labelValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

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

export async function sendGroupCabinRequestEmail(input: GroupCabinRequestAlert): Promise<EmailAlertStatus> {
  const config = getResendConfiguration();
  if (!config) return "not_configured";
  const contactName = `${input.contactFirstName} ${input.contactLastName}`;
  const travelerCount = input.rooms.reduce((total, room) => total + room.travelers.length, 0);
  const detailRooms = input.rooms.map((room, index) => {
    const travelers = room.travelers.map((traveler) => {
      const name = [traveler.firstName, traveler.middleName, traveler.lastName].filter(Boolean).join(" ");
      return `${name}, age ${traveler.age}${traveler.dateOfBirth ? `, date of birth ${traveler.dateOfBirth}` : ""}${traveler.loyaltyNumber ? `, loyalty number ${traveler.loyaltyNumber}` : ""}`;
    }).join("; ");
    return `Room ${index + 1}: ${room.occupancy} travelers, ${labelValue(room.roomType)}, ${labelValue(room.locationPreference)}${room.selectedCabinCategory ? `, ${room.selectedCabinCategory}` : ""}. Travelers: ${travelers}. Cabin reference: ${money(room.estimatedFareCents)}. Gratuities reference: ${money(room.estimatedGratuitiesCents)}. Vacation Protection reference: ${money(room.estimatedProtectionCents)}.`;
  });
  const requestRows = [
    ["Email", input.email], ["Phone", input.phone], ["Request", input.revisionNumber > 1 ? `Update ${input.revisionNumber}` : "New family request"],
    ["Rooms", String(input.rooms.length)], ["Travelers", String(travelerCount)], ["Requested add ons", input.amenities.length ? input.amenities.map(labelValue).join(", ") : "None selected"],
    ["Rate qualifiers", input.extras?.rateQualifiers?.length ? input.extras.rateQualifiers.map(labelValue).join(", ") : "None selected"],
    ["Wi Fi", input.extras?.wifiPlan ? `${input.extras.wifiPlan}, ${input.extras.wifiUsers || 0} user${input.extras.wifiUsers === 1 ? "" : "s"}` : "Not selected"],
    ["Beverage package", input.extras?.cheersAdults ? `${input.extras.cheersAdults} adult${input.extras.cheersAdults === 1 ? "" : "s"}` : "Not selected"],
    ["Specialty dining", input.extras?.diningExperience ? `${input.extras.diningExperience}, ${input.extras.diningAdults || 0} adults, ${input.extras.diningChildren || 0} children, ${money(input.extras.diningTotalCents)}` : "Not selected"],
    ["Cabin reference total", money(input.estimate?.cabinTotalCents)], ["Optional add ons", money(input.estimate?.extrasTotalCents)], ["Planning reference total", money(input.estimate?.tripTotalCents)],
    ["Deposit reference", money(input.estimate?.depositCents)], ["Onboard credit reference", money(input.estimate?.onboardCreditCents)], ["Client notes", input.notes || "Not provided"],
  ];
  const text = [
    `${input.revisionNumber > 1 ? "Updated" : "New"} Grimsley cabin request from ${contactName}`,
    "",
    ...requestRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Room and traveler details:",
    ...detailRooms,
    "",
    "Open Wendy’s workspace to review the complete request and prepare a live quote.",
  ].join("\n");
  const rows = requestRows.map(([label, value]) => `<tr><td style="padding:10px 17px 10px 0;border-top:1px solid #ded8cd;color:#6a716f;font:600 10px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;vertical-align:top">${htmlEscape(label)}</td><td style="padding:10px 0;border-top:1px solid #ded8cd;color:#0d1c22;font:14px Arial,sans-serif;line-height:1.55">${htmlEscape(value)}</td></tr>`).join("");
  const roomBlocks = detailRooms.map((room, index) => `<section style="margin-top:16px;padding:17px;border:1px solid #ded8cd;background:#f8f5ee"><strong style="color:#0d1c22;font:600 12px Arial,sans-serif">Room ${index + 1}</strong><p style="margin:8px 0 0;color:#425056;font:14px Arial,sans-serif;line-height:1.65">${htmlEscape(room.replace(`Room ${index + 1}: `, ""))}</p></section>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#edf0ed;padding:28px 12px"><main style="max-width:620px;margin:0 auto;background:#fffdf8;color:#0d1c22"><header style="padding:36px 38px;background:#0d1c22;color:#f6f2e9"><p style="margin:0 0 15px;color:#c4a26b;font:600 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">The Wendy Collective</p><h1 style="margin:0;font:500 32px Georgia,serif;line-height:1.1">${input.revisionNumber > 1 ? "An updated cabin request is waiting." : "A school cruise cabin request is waiting."}</h1></header><section style="padding:34px 38px"><p style="margin:0 0 24px;color:#425056;font:16px Arial,sans-serif;line-height:1.6">${htmlEscape(contactName)} has ${input.revisionNumber > 1 ? "updated" : "submitted"} a request for the Grimsley High School Graduation Cruise. The complete approved planning record is below.</p><table style="width:100%;border-collapse:collapse">${rows}</table><h2 style="margin:30px 0 0;color:#0d1c22;font:500 24px Georgia,serif">Room and traveler details</h2>${roomBlocks}<p style="margin:24px 0 0;color:#59666a;font:13px Arial,sans-serif;line-height:1.6">Sign in to Wendy’s workspace to review the request and prepare the live quote. Do not reply with payment, passport, password, or supplier-account information.</p></section></main></body></html>`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `group-cabin-request/${input.requestId}` },
      body: JSON.stringify({
        from: config.from,
        to: [config.recipient],
        reply_to: input.email,
        subject: `New Grimsley cabin request from ${contactName}`,
        html,
        text,
        tags: [{ name: "category", value: "group_cabin_request" }, { name: "request_id", value: String(input.requestId) }],
      }),
    });
    if (!response.ok) { console.error("[Resend] Group cabin request email was not accepted", { status: response.status, requestId: input.requestId }); return "failed"; }
    return "sent";
  } catch (error) {
    console.error("[Resend] Group cabin request email request failed", { requestId: input.requestId, error });
    return "failed";
  }
}
