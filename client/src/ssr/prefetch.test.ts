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

  it("returns crawler-visible metadata for the public school cruise experience", () => {
    const metadata = prefetchForPath("/experiences/grimsley-hs-graduation-cruise-2027");
    expect(metadata.title).toContain("Grimsley High School Graduation Cruise 2027");
    expect(metadata.canonicalPath).toBe("/experiences/grimsley-hs-graduation-cruise-2027");
    expect(metadata.noindex).not.toBe(true);
  });

  it("keeps opaque private proposal links out of search results", () => {
    const metadata = prefetchForPath("/proposal/nO2cJ2DLexS4dd7zxjgTLRwODnP0CZ5oOQgZkpt4pWk");
    expect(metadata.title).toContain("Private Proposal");
    expect(metadata.noindex).toBe(true);
  });

  it("does not index Wendy’s protected workspace and returns a genuine 404 for unknown paths", () => {
    expect(prefetchForPath("/wendy")).toMatchObject({ noindex: true });
    expect(prefetchForPath("/wendy").notFound).not.toBe(true);
    expect(prefetchForPath("/unknown-route")).toMatchObject({ notFound: true });
  });
});
