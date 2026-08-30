import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dealStages, groupPipelineStage } from "./types";

const projectRoot = "/home/ubuntu/the-wendy-collective";
const readSource = (relativePath: string) => readFileSync(`${projectRoot}/${relativePath}`, "utf8");

describe("focused Wendy CRM workspace", () => {
  it("maps each group workflow stage into a visible CRM pipeline stage", () => {
    expect(groupPipelineStage.group_setup).toBe("new_inquiry");
    expect(groupPipelineStage.proposal_build).toBe("building_proposal");
    expect(groupPipelineStage.family_details).toBe("family_details");
    expect(groupPipelineStage.live_quote).toBe("ready_to_book");
    expect(groupPipelineStage.booking).toBe("booking");
    expect(groupPipelineStage.booked).toBe("booked");
  });

  it("keeps every individual CRM stage addressable, including closed records", () => {
    expect(dealStages).toContain("new_inquiry");
    expect(dealStages).toContain("proposal_shared");
    expect(dealStages).toContain("booked");
    expect(dealStages).toContain("closed");
    expect(readSource("client/src/pages/wendy/WendyPipeline.tsx")).toContain("dealStages.map");
  });

  it("keeps Grimsley in a focused stage profile with family review, history, and private-link controls", () => {
    const source = readSource("client/src/pages/wendy/WendyGroups.tsx");
    expect(source).toContain('"stage" | "families" | "history"');
    expect(source).toContain("Create 30 day family link");
    expect(source).toContain("Family request inbox");
    expect(source).toContain("JourneyRail");
    expect(source).toContain("Secure Grimsley family link. Copy this address and send it to the family.");
  });

  it("registers each internal workspace view behind the Wendy route namespace", () => {
    const source = readSource("client/src/App.tsx");
    expect(source).toContain('path="/wendy/pipeline/:stage"');
    expect(source).toContain('path="/wendy/clients/:id"');
    expect(source).toContain('path="/wendy/groups/:key"');
    expect(source).toContain('path="/wendy/proposals"');
    expect(source).toContain('path="/wendy/library"');
  });
});
