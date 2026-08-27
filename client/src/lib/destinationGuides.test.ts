import { describe, expect, it } from "vitest";
import { destinationGuides, guideInquiryHref } from "./destinationGuides";
import { readTripBriefPrefill } from "../pages/Contact";

describe("destination guide conversion handoff", () => {
  it("creates a contextual brief URL for every curated guide", () => {
    expect(destinationGuides).toHaveLength(5);
    destinationGuides.forEach((guide) => {
      const href = guideInquiryHref(guide);
      expect(href).toContain(`/contact?type=${guide.travelType}`);
      expect(new URL(href, "https://thewendycollective.com").searchParams.get("destination")).toBe(guide.label);
    });
  });

  it("prefills the trip brief from a guide and resets on a plain contact visit", () => {
    const caribbean = readTripBriefPrefill("?type=caribbean&destination=Caribbean&guide=caribbean");
    expect(caribbean.form.travelType).toBe("caribbean");
    expect(caribbean.form.destinations).toBe("Caribbean");
    expect(caribbean.guideLabel).toBe("Caribbean");

    const plainContact = readTripBriefPrefill("");
    expect(plainContact.form.travelType).toBe("custom");
    expect(plainContact.form.destinations).toBe("");
    expect(plainContact.guideLabel).toBe("");
  });
});
