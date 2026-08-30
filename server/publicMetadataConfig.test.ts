import { describe, expect, it } from "vitest";

describe("public metadata configuration", () => {
  it("uses the branded public origin and site name in the live metadata response", async () => {
    const origin = process.env.CANONICAL_ORIGIN;
    const siteName = process.env.SITE_NAME;
    expect(origin).toBe("https://thewendycollective.com");
    expect(siteName).toBe("The Wendy Collective");
    const response = await fetch(`${origin}/`);
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain(`<meta property="og:site_name" content="${siteName}" />`);
  }, 15_000);
});
