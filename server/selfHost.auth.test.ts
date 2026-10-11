// Self-host (SELF_HOST=1) authentication: staff portal passwords + signed
// session cookies. Proves every protected route refuses anonymous and forged
// sessions over real HTTP, and that public routes stay public.
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { SignJWT } from "jose";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { TEST_SECRET, WENDY_PASSWORD, JUNAID_PASSWORD, saved } = vi.hoisted(() => {
  // Runs before the module imports below, so import-time code sees self-host mode.
  const constants = { TEST_SECRET: "test-secret-0123456789abcdef0123456789abcdef", WENDY_PASSWORD: "wendy-test-password-xyz", JUNAID_PASSWORD: "junaid-test-password-xyz" };
  const testEnv: Record<string, string | undefined> = {
    SELF_HOST: "1",
    JWT_SECRET: constants.TEST_SECRET,
    VITE_APP_ID: undefined,
    OAUTH_SERVER_URL: undefined,
    BUILT_IN_FORGE_API_URL: undefined,
    BUILT_IN_FORGE_API_KEY: undefined,
    DATABASE_URL: undefined,
    TWC_WENDY_PORTAL_PASSWORD: constants.WENDY_PASSWORD,
    TWC_JUNAID_PORTAL_PASSWORD: constants.JUNAID_PASSWORD,
  };
  const saved: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(testEnv)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return { ...constants, saved };
});

const users = vi.hoisted(() => new Map<string, Record<string, unknown>>());
const mocks = vi.hoisted(() => ({ getTripInquiries: vi.fn(async () => []) }));
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    getTripInquiries: mocks.getTripInquiries,
    getUserByOpenId: vi.fn(async (openId: string) => users.get(openId)),
    upsertUser: vi.fn(async (user: Record<string, unknown>) => {
      const openId = String(user.openId);
      const now = new Date();
      users.set(openId, { id: users.size + 1, name: null, email: null, loginMethod: null, role: "user", createdAt: now, updatedAt: now, lastSignedIn: now, ...users.get(openId), ...user });
    }),
  };
});

import { createApp } from "./_core/app";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";

// Public by design: marketing inquiry intake, staff sign-in, and token-gated
// client links (each requires a 32+ char random token).
const PUBLIC_PROCEDURES = new Set([
  "system.health",
  "auth.me",
  "auth.staffLogin",
  "auth.logout",
  "inquiries.create",
  "groupCruises.createCabinRequest",
  "groupCruises.getFamilyPortal",
  "crm.getPrivateProposal",
  "crm.getTravelerProfile",
  "crm.getPrivateGroupProfile",
  "crm.submitProposalResponse",
  "crm.submitTravelerProfile",
]);

const procedures = Object.entries((appRouter as unknown as { _def: { procedures: Record<string, { _def: { type: "query" | "mutation" } }> } })._def.procedures);
const protectedProcedures = procedures.filter(([path]) => !PUBLIC_PROCEDURES.has(path));

let server: Server;
let base = "";

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

beforeEach(() => {
  users.clear();
  process.env.TWC_WENDY_PORTAL_PASSWORD = WENDY_PASSWORD;
  process.env.TWC_JUNAID_PORTAL_PASSWORD = JUNAID_PASSWORD;
});

async function callProcedure(path: string, type: "query" | "mutation", cookie?: string, input?: unknown) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}` };
  if (cookie) headers.cookie = cookie;
  const body = JSON.stringify({ json: input ?? null });
  const response = type === "query"
    ? await fetch(`${base}/api/trpc/${path}?input=${encodeURIComponent(body)}`, { headers })
    : await fetch(`${base}/api/trpc/${path}`, { method: "POST", headers, body });
  const payload = await response.json().catch(() => null) as { result?: { data?: { json?: unknown } }; error?: { json?: { data?: { code?: string } } } } | null;
  return { status: response.status, data: payload?.result?.data?.json, code: payload?.error?.json?.data?.code, setCookie: response.headers.get("set-cookie") };
}

async function sign(payload: Record<string, unknown>, secret = TEST_SECRET) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime("1h").sign(new TextEncoder().encode(secret));
}

function seedStaff(openId = "twc_staff_wendy") {
  const now = new Date();
  users.set(openId, { id: 1, openId, name: "Wendy", email: null, loginMethod: "twc_staff_password", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now });
}

describe("self-host auth: route inventory", () => {
  it("keeps the public procedure list exactly as reviewed (new public routes must be added here deliberately)", () => {
    expect(procedures.length).toBeGreaterThan(30);
    for (const path of Array.from(PUBLIC_PROCEDURES)) expect(procedures.map(([p]) => p)).toContain(path);
  });
});

describe("self-host auth: anonymous access is refused", () => {
  it.each(protectedProcedures.map(([path, procedure]) => [path, procedure._def.type] as const))("refuses %s without a session", async (path, type) => {
    const result = await callProcedure(path, type);
    expect([401, 403]).toContain(result.status);
    expect(["UNAUTHORIZED", "FORBIDDEN"]).toContain(result.code);
  });

  it("returns no user for anonymous auth.me", async () => {
    const result = await callProcedure("auth.me", "query");
    expect(result.status).toBe(200);
    expect(result.data).toBeNull();
  });

  it("disables the Manus OAuth callback", async () => {
    const response = await fetch(`${base}/api/oauth/callback?code=x&state=y`);
    expect(response.status).toBe(404);
  });

  it("keeps the optional admin data export hidden unless enabled, and admin-only when enabled", async () => {
    expect((await fetch(`${base}/api/admin/data-export`)).status).toBe(404);
    process.env.ENABLE_ADMIN_DATA_EXPORT = "1";
    try {
      expect((await fetch(`${base}/api/admin/data-export`)).status).toBe(403);
    } finally {
      delete process.env.ENABLE_ADMIN_DATA_EXPORT;
    }
  });

  it("serves a healthcheck without auth", async () => {
    const response = await fetch(`${base}/healthz`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, mode: "self-host", database: "unconfigured" });
  });
});

describe("self-host auth: forged or foreign sessions are refused", () => {
  const dashboard = () => protectedProcedures.find(([path]) => path === "privateExperience.dashboard")!;

  it("rejects a staff token signed with the wrong secret", async () => {
    seedStaff();
    const token = await sign({ openId: "twc_staff_wendy", appId: "twc-self-host", name: "Wendy" }, "some-other-secret-0123456789abcdef");
    expect((await callProcedure(dashboard()[0], "query", `${COOKIE_NAME}=${token}`)).status).toBe(403);
  });

  it("rejects a correctly signed token for a non-staff (Manus OAuth) user even if they are an admin in the DB", async () => {
    const now = new Date();
    users.set("manus_owner_open_id", { id: 9, openId: "manus_owner_open_id", name: "Owner", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now });
    const token = await sign({ openId: "manus_owner_open_id", appId: "twc-self-host", name: "Owner" });
    expect((await callProcedure(dashboard()[0], "query", `${COOKIE_NAME}=${token}`)).status).toBe(403);
    expect((await callProcedure("auth.me", "query", `${COOKIE_NAME}=${token}`)).data).toBeNull();
  });

  it("rejects a token minted for the Manus app id", async () => {
    seedStaff();
    const token = await sign({ openId: "twc_staff_wendy", appId: "manus-app-id", name: "Wendy" });
    expect((await callProcedure(dashboard()[0], "query", `${COOKIE_NAME}=${token}`)).status).toBe(403);
  });

  it("rejects a staff session once that staff password is removed", async () => {
    seedStaff("twc_staff_junaid");
    const token = await sign({ openId: "twc_staff_junaid", appId: "twc-self-host", name: "Junaid" });
    delete process.env.TWC_JUNAID_PORTAL_PASSWORD;
    expect((await callProcedure(dashboard()[0], "query", `${COOKIE_NAME}=${token}`)).status).toBe(403);
  });

  it("rejects an expired staff token", async () => {
    seedStaff();
    const token = await new SignJWT({ openId: "twc_staff_wendy", appId: "twc-self-host", name: "Wendy" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(Math.floor(Date.now() / 1000) - 60).sign(new TextEncoder().encode(TEST_SECRET));
    expect((await callProcedure(dashboard()[0], "query", `${COOKIE_NAME}=${token}`)).status).toBe(403);
  });
});

describe("self-host auth: staff portal login end to end", () => {
  it("rejects a wrong password and sets no cookie", async () => {
    const result = await callProcedure("auth.staffLogin", "mutation", undefined, { username: "wendy", password: "wrong" });
    expect(result.status).toBe(401);
    expect(result.setCookie).toBeNull();
  });

  it("logs Wendy in with her portal password and the session cookie unlocks protected routes", async () => {
    const login = await callProcedure("auth.staffLogin", "mutation", undefined, { username: "wendy", password: WENDY_PASSWORD });
    expect(login.status).toBe(200);
    expect(login.setCookie).toMatch(new RegExp(`^${COOKIE_NAME}=`));
    expect(login.setCookie).toMatch(/HttpOnly/i);
    expect(login.setCookie).not.toContain(WENDY_PASSWORD);
    const cookie = login.setCookie!.split(";")[0];

    const me = await callProcedure("auth.me", "query", cookie);
    expect(me.data).toMatchObject({ openId: "twc_staff_wendy", role: "admin" });

    const dashboard = await callProcedure("privateExperience.dashboard", "query", cookie);
    expect(dashboard.status).toBe(200);
    expect(dashboard.data).toMatchObject({ firstName: "Wendy", inquiries: [] });
  });

  it("logs Junaid in with his portal password", async () => {
    const login = await callProcedure("auth.staffLogin", "mutation", undefined, { username: "junaid", password: JUNAID_PASSWORD });
    expect(login.status).toBe(200);
    const me = await callProcedure("auth.me", "query", login.setCookie!.split(";")[0]);
    expect(me.data).toMatchObject({ openId: "twc_staff_junaid", role: "admin" });
  });
});
