import { describe, expect, it } from "vitest";
import { prefetchForPath } from "../client/src/ssr/prefetch";

describe("public metadata configuration", () => {
  it("uses the branded public origin and site name in the server metadata contract", () => {
    const origin = process.env.CANONICAL_ORIGIN;
    const siteName = process.env.SITE_NAME;
    expect(origin).toBe("https://thewendycollective.com");
    expect(siteName).toBe("The Wendy Collective");
    expect(prefetchForPath("/")).toMatchObject({ title: "The Wendy Collective | Thoughtfully Planned Travel", description: expect.any(String) });
  });

  it("marks traveler-profile token routes as private during server rendering", () => {
    const meta = prefetchForPath("/traveler-profile/nO2cJ2DLexS4dd7zxjgTLRwODnP0CZ5oOQgZkpt4pWk");
    expect(meta).toMatchObject({ title: "Private Traveler Profile | The Wendy Collective", noindex: true });
    expect(meta.canonicalPath).toBeUndefined();
  });
});
