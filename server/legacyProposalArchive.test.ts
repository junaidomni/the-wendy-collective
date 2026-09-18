import { describe, expect, it } from "vitest";
import { getLegacyProposalArchive } from "./legacyProposalArchive";

describe("legacy proposal archive", () => {
  it("retains the five supplied legacy proposal records as nonshareable internal references", () => {
    const archive = getLegacyProposalArchive();

    expect(archive).toHaveLength(5);
    expect(archive.map(item => item.id)).toEqual([
      "monroe-maldives-2027",
      "chanelle-turns-30",
      "denise-ruff-family-holiday-2026",
      "osx-command-bahamas",
      "denise-ruff-50th-cruise",
    ]);
    expect(archive.every(item => item.sharePolicy === "not_shareable")).toBe(
      true
    );
  });

  it("preserves the separate Denise records and required review safeguards", () => {
    const archive = getLegacyProposalArchive();
    const familyHoliday = archive.find(
      item => item.id === "denise-ruff-family-holiday-2026"
    );
    const fiftieth = archive.find(
      item => item.id === "denise-ruff-50th-cruise"
    );
    const chanelle = archive.find(item => item.id === "chanelle-turns-30");

    expect(familyHoliday?.notes).toContain("distinct");
    expect(fiftieth?.notes).toContain("separate");
    expect(chanelle?.reviewStatus).toBe("content reconciliation needed");
    expect(chanelle?.requiredBeforeSharing).toContain("Confirm the selected hotel and package scope with Wendy");
  });

  it("records recovered route and hosting details without importing unsafe legacy intake fields", () => {
    const archive = getLegacyProposalArchive();
    const bahamas = archive.find(item => item.id === "osx-command-bahamas");
    const chanelle = archive.find(item => item.id === "chanelle-turns-30");
    const brochure = archive.find(item => item.id === "denise-ruff-50th-cruise");

    expect(bahamas?.hostedUrl).toBe("https://omniscope-bahamas-resorts.wendailey.chatgpt.site");
    expect(chanelle?.route).toBe("/experiences/chanelle-turns-30");
    expect(brochure?.proposalMode).toContain("Cruise comparison");
    expect(JSON.stringify(archive).toLowerCase()).not.toContain("passport number");
    expect(JSON.stringify(archive).toLowerCase()).not.toContain("emergency contact");
  });
});
