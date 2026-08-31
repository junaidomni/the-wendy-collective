import { describe, expect, it } from "vitest";
import { isResendConfigured } from "./resendAlerts";

describe("future submission-alert recipient", () => {
  it("keeps the approved recipient available while delivery remains inactive without sender credentials", () => {
    expect(process.env.RESEND_ALERT_RECIPIENT).toBe("info@thewendycollective.com");
    expect(isResendConfigured()).toBe(false);
  });
});
