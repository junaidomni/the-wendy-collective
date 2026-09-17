import { timingSafeEqual } from "node:crypto";

export const STAFF_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export type StaffIdentity = {
  username: "wendy" | "junaid";
  openId: string;
  name: string;
  email: string | null;
};

const staff: Record<StaffIdentity["username"], Omit<StaffIdentity, "username"> & { password: () => string }> = {
  wendy: { openId: "twc_staff_wendy", name: "Wendy", email: "info@thewendycollective.com", password: () => process.env.TWC_WENDY_PORTAL_PASSWORD ?? "" },
  junaid: { openId: "twc_staff_junaid", name: "Junaid", email: null, password: () => process.env.TWC_JUNAID_PORTAL_PASSWORD ?? "" },
};

export function verifyStaffCredentials(username: string, password: string): StaffIdentity | null {
  const normalized = username.trim().toLowerCase();
  if (normalized !== "wendy" && normalized !== "junaid") return null;
  const entry = staff[normalized];
  const expected = entry.password();
  const candidate = password ?? "";
  if (!expected || !candidate || expected.length !== candidate.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))) return null;
  return { username: normalized, openId: entry.openId, name: entry.name, email: entry.email };
}
