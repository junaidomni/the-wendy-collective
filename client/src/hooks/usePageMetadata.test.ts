import { describe, expect, it } from "vitest";
import { metadataForPath } from "./usePageMetadata";

describe("page metadata", () => {
  it("provides distinct indexable metadata for public travel pages", () => {
    expect(metadataForPath("/destinations/caribbean")).toMatchObject({ indexable: true, title: "Caribbean Travel Planning | The Wendy Collective" });
    expect(metadataForPath("/contact")).toMatchObject({ indexable: true, title: "Plan Your Journey | The Wendy Collective" });
  });

  it("protects Wendy’s workspace and unknown routes from indexing", () => {
    expect(metadataForPath("/wendy").indexable).toBe(false);
    expect(metadataForPath("/wendy/login")).toMatchObject({ indexable: false, title: "Staff Login | The Wendy Collective" });
    expect(metadataForPath("/group/secure-token").indexable).toBe(false);
    expect(metadataForPath("/family/secure-token").indexable).toBe(false);
    expect(metadataForPath("/traveler-profile/secure-token").indexable).toBe(false);
    expect(metadataForPath("/not-found").indexable).toBe(false);
  });
});
