import { describe, expect, it } from "vitest";
import { prefetchForPath } from "./prefetch";

describe("server-rendered page metadata", () => {
  it("returns indexable canonical metadata for every public destination guide", () => {
    for (const route of ["/destinations/caribbean", "/destinations/mexico", "/destinations/all-inclusive", "/destinations/groups", "/destinations/cruises"]) {
      const head = prefetchForPath(route);
      expect(head.canonicalPath).toBe(route);
      expect(head.noindex).not.toBe(true);
      expect(head.notFound).not.toBe(true);
      expect(head.ogImage).toContain("twc-social-preview");
    }
  });

  it("does not index Wendy’s protected workspace and returns a genuine 404 for unknown paths", () => {
    expect(prefetchForPath("/wendy")).toMatchObject({ noindex: true });
    expect(prefetchForPath("/wendy").notFound).not.toBe(true);
    expect(prefetchForPath("/unknown-route")).toMatchObject({ notFound: true });
  });
});
