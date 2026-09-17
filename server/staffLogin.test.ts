import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsertUser: vi.fn() }));
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, upsertUser: mocks.upsertUser };
});

import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

function createContext() {
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {}, ip: "203.0.113.9" } as TrpcContext["req"],
    res: { cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }) } as TrpcContext["res"],
  };
  return { ctx, cookies };
}

describe("staff portal login", () => {
  it("creates an admin session for an authorized Wendy password without exposing that password", async () => {
    mocks.upsertUser.mockResolvedValue(undefined);
    const { ctx, cookies } = createContext();
    const result = await appRouter.createCaller(ctx).auth.staffLogin({ username: "wendy", password: process.env.TWC_WENDY_PORTAL_PASSWORD ?? "" });
    expect(result).toEqual({ success: true, user: { name: "Wendy", username: "wendy" } });
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "twc_staff_wendy", role: "admin", loginMethod: "twc_staff_password" }));
    expect(cookies[0]).toMatchObject({ name: COOKIE_NAME, options: expect.objectContaining({ httpOnly: true, secure: true, sameSite: "none" }) });
    expect(cookies[0]?.value).not.toContain(process.env.TWC_WENDY_PORTAL_PASSWORD ?? "");
  });

  it("rejects an incorrect staff password", async () => {
    const { ctx } = createContext();
    await expect(appRouter.createCaller(ctx).auth.staffLogin({ username: "junaid", password: "incorrect" })).rejects.toMatchObject({ message: "Incorrect staff username or password." });
  });
});
