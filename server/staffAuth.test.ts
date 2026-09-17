import { describe, expect, it } from "vitest";
import { verifyStaffCredentials } from "./staffAuth";

describe("staff portal credentials", () => {
  it("accepts only the configured Wendy and Junaid passwords", () => {
    expect(verifyStaffCredentials("wendy", process.env.TWC_WENDY_PORTAL_PASSWORD ?? "")).toMatchObject({ username: "wendy", openId: "twc_staff_wendy", name: "Wendy" });
    expect(verifyStaffCredentials("junaid", process.env.TWC_JUNAID_PORTAL_PASSWORD ?? "")).toMatchObject({ username: "junaid", openId: "twc_staff_junaid", name: "Junaid" });
    expect(verifyStaffCredentials("wendy", "not-the-password")).toBeNull();
    expect(verifyStaffCredentials("unknown", "anything")).toBeNull();
  });
});
