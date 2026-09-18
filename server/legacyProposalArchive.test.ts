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
    expect(chanelle?.requiredBeforeSharing).toContain(
      "Obtain standalone source and Vercel project access"
    );
  });
});
