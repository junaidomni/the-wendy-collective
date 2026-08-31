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
    expect(readSource("client/src/lib/site.ts")).toContain("https://thewendycollective.com");
    expect(readSource("client/src/lib/site.ts")).toContain('GRIMSLEY_SHARE_CARD_VERSION = "2"');
    expect(source).toContain("buildGrimsleyFamilyLink");
    expect(source).toContain("Active family link");
    expect(source).toContain("Copy family link");
    expect(source).toContain("Completed stage review");
    expect(source).toContain("Review");
    expect(source).toContain("Current request");
    expect(source).toContain("family-revision-history");
    expect(source).toContain("New family response");
    expect(source).toContain("Review families");
    expect(source).toContain("Manage submissions");
    expect(source).toContain("Type DELETE to confirm");
    expect(source).toContain("deleteCabinRequestHousehold");
  });

  it("keeps public inquiries and linked package responses distinct in Wendy Today", () => {
    const source = readSource("client/src/pages/wendy/WendyToday.tsx");
    expect(source).toContain("Submission alerts");
    expect(source).toContain("Website inquiries enter the pipeline");
    expect(source).toContain("Group response");
  });

  it("offers a Wendy-only typed confirmation to delete only original website inquiries", () => {
    const clients = readSource("client/src/pages/wendy/WendyClients.tsx");
    const pipeline = readSource("client/src/pages/wendy/WendyPipeline.tsx");
    const control = readSource("client/src/pages/wendy/PublicInquiryDeletionControl.tsx");
    expect(clients).toContain("PublicInquiryDeletionControl");
    expect(pipeline).toContain('selectedStage === "new_inquiry"');
    expect(control).toContain("Manage website inquiries");
    expect(control).toContain("Type DELETE to confirm");
    expect(control).toContain("deletePublicInquiry");
    expect(control).toContain('deal.sourceType === "trip_inquiry"');
  });

  it("shows the original website intake and a call-first workspace for New Inquiry client profiles", () => {
    const clients = readSource("client/src/pages/wendy/WendyClients.tsx");
    expect(clients).toContain("PublicInquiryIntake");
    expect(clients).toContain("Original website submission");
    expect(clients).toContain("Inquiry details");
    expect(clients).toContain("Call first, then schedule the next conversation.");
    expect(clients).toContain("Save call outcome and schedule discovery");
    expect(clients).toContain("Original intake saved");
  });

  it("places the client journey rail before the trip profile and intake content", () => {
    const clients = readSource("client/src/pages/wendy/WendyClients.tsx");
    const railPosition = clients.indexOf("<JourneyRail current={deal.stage} />");
    const profilePosition = clients.indexOf('<section className={`profile-hero');
    const intakePosition = clients.indexOf("<PublicInquiryIntake inquiry={inquiry}");
    expect(railPosition).toBeGreaterThan(-1);
    expect(profilePosition).toBeGreaterThan(railPosition);
    expect(intakePosition).toBeGreaterThan(profilePosition);
  });

  it("prepares local discovery scheduling and a Calendar workspace without activating Google", () => {
    const clients = readSource("client/src/pages/wendy/WendyClients.tsx");
    const calendar = readSource("client/src/pages/wendy/WendyCalendar.tsx");
    const shell = readSource("client/src/pages/wendy/WendyShell.tsx");
    expect(clients).toContain("Schedule the conversation locally.");
    expect(clients).toContain("Google Calendar, Google Meet, and the client invitation will be created only after Wendy connects");
    expect(calendar).toContain("Google sync inactive");
    expect(calendar).toContain("Block time or mark an opening.");
    expect(shell).toContain('{ href: "/wendy/calendar", label: "Calendar" }');
  });

  it("registers a token-gated household portal with a retained update link and confirmation message", () => {
    const app = readSource("client/src/App.tsx");
    const cruise = readSource("client/src/pages/SchoolCruise.tsx");
    expect(app).toContain('path="/family/:token"');
    expect(cruise).toContain("Thank you. Wendy will be in touch.");
    expect(cruise).toContain("Review or update your request");
    expect(cruise).not.toContain("Open your private family portal");
    expect(cruise).toContain("familyPortalToken");
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
