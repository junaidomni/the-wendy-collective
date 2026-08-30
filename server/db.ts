import { desc, eq, inArray } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import {
  advisorDeals,
  clientProposals,
  cruiseExperiences,
  groupCabinRequestRooms,
  groupCabinRequestTravelers,
  groupCabinRequests,
  groupTravelProfiles,
  InsertPrivateClientRequest,
  InsertTripInquiry,
  InsertUser,
  privateClientRequests,
  proposalResponses,
  tripInquiries,
  users,
  workflowStageEvents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export type CreateTripInquiryInput = Pick<InsertTripInquiry, "firstName" | "lastName" | "email" | "phone" | "travelType" | "destinations" | "travelTiming" | "dateFlexibility" | "budget" | "groupSize" | "priorities">;

export async function createTripInquiry(input: CreateTripInquiryInput) {
  const db = await getDb();
  if (!db) throw new Error("Trip inquiry storage is unavailable");
  const result = await db.insert(tripInquiries).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getTripInquiries(limit = 75) {
  const db = await getDb();
  if (!db) throw new Error("Trip inquiry storage is unavailable");
  return db.select().from(tripInquiries).orderBy(desc(tripInquiries.createdAt)).limit(limit);
}

export type CreatePrivateClientRequestInput = Pick<InsertPrivateClientRequest, "userId" | "requestType" | "message">;

export async function createPrivateClientRequest(input: CreatePrivateClientRequestInput) {
  const db = await getDb();
  if (!db) throw new Error("Private request storage is unavailable");
  const result = await db.insert(privateClientRequests).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getPrivateClientRequests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Private request storage is unavailable");
  return db.select().from(privateClientRequests).where(eq(privateClientRequests.userId, userId)).orderBy(desc(privateClientRequests.createdAt)).limit(8);
}

export type CreateGroupCabinRequestInput = {
  groupKey: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  amenities: string[];
  extras?: Record<string, unknown>;
  estimate?: Record<string, unknown>;
  notes: string;
  rooms: Array<{
    occupancy: number;
    roomType: string;
    locationPreference: string;
    selectedCabinCategory?: string;
    estimatedFareCents?: number;
    estimatedGratuitiesCents?: number;
    estimatedProtectionCents?: number;
    travelers: Array<{
      firstName: string;
      middleName?: string;
      lastName: string;
      age: number;
      dateOfBirth?: string;
      loyaltyNumber?: string;
    }>;
  }>;
};

export async function createGroupCabinRequest(input: CreateGroupCabinRequestInput) {
  const db = await getDb();
  if (!db) throw new Error("Group cabin request storage is unavailable");
  const result = await db.insert(groupCabinRequests).values({
    groupKey: input.groupKey,
    contactFirstName: input.contactFirstName,
    contactLastName: input.contactLastName,
    email: input.email,
    phone: input.phone,
    roomCount: input.rooms.length,
    amenitiesJson: JSON.stringify(input.amenities),
    extrasJson: input.extras ? JSON.stringify(input.extras) : null,
    estimateJson: input.estimate ? JSON.stringify(input.estimate) : null,
    notes: input.notes || null,
  });
  const cabinRequestId = Number(result[0].insertId);
  for (let roomIndex = 0; roomIndex < input.rooms.length; roomIndex += 1) {
    const room = input.rooms[roomIndex];
    const roomResult = await db.insert(groupCabinRequestRooms).values({
      cabinRequestId,
      roomNumber: roomIndex + 1,
      occupancy: room.occupancy,
      roomType: room.roomType,
      locationPreference: room.locationPreference,
      selectedCabinCategory: room.selectedCabinCategory || null,
      estimatedFareCents: room.estimatedFareCents ?? null,
      estimatedGratuitiesCents: room.estimatedGratuitiesCents ?? null,
      estimatedProtectionCents: room.estimatedProtectionCents ?? null,
    });
    const roomId = Number(roomResult[0].insertId);
    await db.insert(groupCabinRequestTravelers).values(room.travelers.map((traveler) => ({
      roomId,
      firstName: traveler.firstName,
      middleName: traveler.middleName || null,
      lastName: traveler.lastName,
      age: traveler.age,
      dateOfBirth: traveler.dateOfBirth || null,
      loyaltyNumber: traveler.loyaltyNumber || null,
    })));
  }
  return { id: cabinRequestId };
}

export async function getGroupCabinRequests(groupKey = "grimsley-hs-graduation-cruise-2027") {
  const db = await getDb();
  if (!db) throw new Error("Group cabin request storage is unavailable");
  const requests = await db.select().from(groupCabinRequests).where(eq(groupCabinRequests.groupKey, groupKey)).orderBy(desc(groupCabinRequests.createdAt)).limit(100);
  if (!requests.length) return [];
  const rooms = await db.select().from(groupCabinRequestRooms).where(inArray(groupCabinRequestRooms.cabinRequestId, requests.map((request) => request.id)));
  const travelers = rooms.length ? await db.select().from(groupCabinRequestTravelers).where(inArray(groupCabinRequestTravelers.roomId, rooms.map((room) => room.id))) : [];
  return requests.map((request) => ({
    ...request,
    rooms: rooms.filter((room) => room.cabinRequestId === request.id).map((room) => ({
      ...room,
      travelers: travelers.filter((traveler) => traveler.roomId === room.id),
    })),
  }));
}

export async function updateGroupCabinRequestStatus(id: number, status: "new" | "contacted" | "details_received" | "quote_in_progress" | "quote_shared" | "booked" | "closed", advisorNotes: string) {
  const db = await getDb();
  if (!db) throw new Error("Group cabin request storage is unavailable");
  await db.update(groupCabinRequests).set({ status, advisorNotes: advisorNotes || null }).where(eq(groupCabinRequests.id, id));
}

export type CreateExperienceInput = {
  slug: string;
  title: string;
  groupName?: string;
  cruiseLine: string;
  shipName: string;
  embarkPort: string;
  sailingSummary: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  publicSummary?: string;
  itineraryJson?: string;
  roomGuidance?: string;
  shipFactsJson?: string;
  cabinCategoriesJson?: string;
  amenitiesJson?: string;
  sourceReference?: string;
  reviewedOn?: string;
  status: "draft" | "ready" | "archived";
};

export async function createCruiseExperience(input: CreateExperienceInput) {
  const db = await getDb();
  if (!db) throw new Error("Cruise experience storage is unavailable");
  const result = await db.insert(cruiseExperiences).values({
    ...input,
    groupName: input.groupName || null,
    heroImageUrl: input.heroImageUrl || null,
    heroImageAlt: input.heroImageAlt || null,
    publicSummary: input.publicSummary || null,
    itineraryJson: input.itineraryJson || null,
    roomGuidance: input.roomGuidance || null,
    shipFactsJson: input.shipFactsJson || null,
    cabinCategoriesJson: input.cabinCategoriesJson || null,
    amenitiesJson: input.amenitiesJson || null,
    sourceReference: input.sourceReference || null,
    reviewedOn: input.reviewedOn || null,
  });
  return { id: Number(result[0].insertId) };
}

export async function listCruiseExperiences() {
  const db = await getDb();
  if (!db) throw new Error("Cruise experience storage is unavailable");
  return db.select().from(cruiseExperiences).orderBy(desc(cruiseExperiences.updatedAt)).limit(100);
}

export async function ensureGrimsleyCruiseExperience() {
  const db = await getDb();
  if (!db) throw new Error("Cruise experience storage is unavailable");
  const existing = await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.slug, "grimsley-hs-graduation-cruise-2027")).limit(1);
  if (existing[0]) {
    if (!existing[0].shipFactsJson || !existing[0].cabinCategoriesJson || !existing[0].amenitiesJson) {
      await db.update(cruiseExperiences).set({
        shipFactsJson: existing[0].shipFactsJson || JSON.stringify([{ label: "Cruise length", value: "Four nights" }, { label: "Embarkation", value: "Port Canaveral" }, { label: "Island days", value: "RelaxAway and Celebration Key" }]),
        cabinCategoriesJson: existing[0].cabinCategoriesJson || JSON.stringify(["Interior", "Ocean View", "Balcony", "Suite"]),
        amenitiesJson: existing[0].amenitiesJson || JSON.stringify(["WiFi", "Beverage package", "Soda package", "Specialty dining", "Travel protection"]),
        reviewedOn: existing[0].reviewedOn || new Date().toISOString().slice(0, 10),
      }).where(eq(cruiseExperiences.id, existing[0].id));
      return (await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, existing[0].id)).limit(1))[0];
    }
    return existing[0];
  }
  const created = await createCruiseExperience({
    slug: "grimsley-hs-graduation-cruise-2027",
    title: "Grimsley High School Graduation Cruise 2027",
    groupName: "The Class of 2027",
    cruiseLine: "Carnival Cruise Line",
    shipName: "Mardi Gras",
    embarkPort: "Port Canaveral, Florida",
    sailingSummary: "June 24 to 28, 2027",
    heroImageUrl: "/manus-storage/mardi-gras-approved_10fa6e55.png",
    heroImageAlt: "Carnival Mardi Gras at sea near Port Canaveral",
    publicSummary: "A four-night graduation celebration with two island days at RelaxAway, Half Moon Cay and Celebration Key.",
    itineraryJson: JSON.stringify([
      { day: "June 24", place: "Port Canaveral", detail: "Departing at 3:30 PM" },
      { day: "June 25", place: "Fun Day at Sea", detail: "A full day to enjoy Mardi Gras" },
      { day: "June 26", place: "RelaxAway, Half Moon Cay", detail: "8:00 AM to 4:00 PM" },
      { day: "June 27", place: "Celebration Key", detail: "8:00 AM to 4:00 PM" },
      { day: "June 28", place: "Port Canaveral", detail: "Arriving at 8:00 AM" },
    ]),
    roomGuidance: "Interior, Ocean View, Balcony, and Suite options can be reviewed after Wendy confirms the live category, deck, and forward, mid ship, or aft placement.",
    shipFactsJson: JSON.stringify([{ label: "Cruise length", value: "Four nights" }, { label: "Embarkation", value: "Port Canaveral" }, { label: "Island days", value: "RelaxAway and Celebration Key" }]),
    cabinCategoriesJson: JSON.stringify(["Interior", "Ocean View", "Balcony", "Suite"]),
    amenitiesJson: JSON.stringify(["WiFi", "Beverage package", "Soda package", "Specialty dining", "Travel protection"]),
    reviewedOn: new Date().toISOString().slice(0, 10),
    status: "ready",
  });
  const experience = await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, created.id)).limit(1);
  return experience[0];
}

export type GroupProfileStage = "group_setup" | "proposal_build" | "ready_to_share" | "family_details" | "live_quote" | "booking" | "booked" | "closed";
export type GroupProfileShareStatus = "draft" | "shared" | "paused" | "closed";
export type WorkflowStage = "new_inquiry" | "discovery_call" | "building_proposal" | "proposal_shared" | "family_details" | "ready_to_book" | "booking" | "booked" | "closed";

const workflowStages: WorkflowStage[] = ["new_inquiry", "discovery_call", "building_proposal", "proposal_shared", "family_details", "ready_to_book", "booking", "booked", "closed"];
const groupStageForWorkflow: Record<WorkflowStage, GroupProfileStage> = { new_inquiry: "group_setup", discovery_call: "group_setup", building_proposal: "proposal_build", proposal_shared: "ready_to_share", family_details: "family_details", ready_to_book: "live_quote", booking: "booking", booked: "booked", closed: "closed" };

function parseStageData(raw: string | null | undefined) {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, Record<string, string>> : {};
  } catch { return {}; }
}

function mergeStageData(raw: string | null | undefined, stage: WorkflowStage, data: Record<string, string>) {
  return JSON.stringify({ ...parseStageData(raw), [stage]: data });
}

function nextWorkflowStage(stage: WorkflowStage) {
  const index = workflowStages.indexOf(stage);
  return index >= 0 && index < workflowStages.length - 1 ? workflowStages[index + 1] : undefined;
}

function validateTransition(fromStage: WorkflowStage, toStage: WorkflowStage, input: { nextAction?: string; meetingAt?: Date; meetingNotes?: string; experienceId?: number; reservationReference?: string; stageData?: Record<string, string> }) {
  if (nextWorkflowStage(fromStage) !== toStage) throw new Error("This record can only move to its next workflow stage. Reopen a completed stage before making a correction.");
  if (fromStage === "new_inquiry" && !input.nextAction?.trim() && !input.meetingAt) throw new Error("Add a next action or discovery appointment before continuing.");
  if (fromStage === "discovery_call" && !input.meetingNotes?.trim()) throw new Error("Record the discovery outcome and priorities before building the proposal.");
  if (fromStage === "building_proposal" && !input.experienceId && !input.stageData?.proposalTitle?.trim()) throw new Error("Select an approved experience or save a tailored proposal title before sharing.");
  if (fromStage === "ready_to_book" && !input.stageData?.quoteReference?.trim()) throw new Error("Record the verified live quote reference before proceeding to booking.");
  if (fromStage === "booking" && !input.reservationReference?.trim()) throw new Error("Record the supplier confirmation before marking this trip booked.");
}

async function writeWorkflowStageEvent(input: { entityType: "deal" | "group"; entityId: number; fromStage?: WorkflowStage; toStage: WorkflowStage; action: string; reason?: string; snapshot?: Record<string, string>; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Workflow history storage is unavailable");
  await db.insert(workflowStageEvents).values({ entityType: input.entityType, entityId: input.entityId, fromStage: input.fromStage || null, toStage: input.toStage, action: input.action, reason: input.reason || null, snapshotJson: input.snapshot ? JSON.stringify(input.snapshot) : null, actorUserId: input.actorUserId || null });
}

export async function listWorkflowStageEvents(entityType: "deal" | "group", entityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Workflow history storage is unavailable");
  const events = await db.select().from(workflowStageEvents).where(eq(workflowStageEvents.entityType, entityType)).orderBy(desc(workflowStageEvents.createdAt)).limit(100);
  return events.filter((event) => event.entityId === entityId);
}

export async function ensureGrimsleyGroupProfile() {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const experience = await ensureGrimsleyCruiseExperience();
  const existing = await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.groupKey, "grimsley-hs-graduation-cruise-2027")).limit(1);
  if (existing[0]) {
    const legacyStageMap = {
      group_setup: "new_inquiry",
      proposal_build: "building_proposal",
      ready_to_share: "proposal_shared",
      family_details: "family_details",
      live_quote: "ready_to_book",
      booking: "booking",
      booked: "booked",
      closed: "closed",
    } as const;
    const mappedStage = legacyStageMap[existing[0].stage];
    if (existing[0].workflowStage === "new_inquiry" && mappedStage !== "new_inquiry") {
      await db.update(groupTravelProfiles).set({ workflowStage: mappedStage }).where(eq(groupTravelProfiles.id, existing[0].id));
      return (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, existing[0].id)).limit(1))[0];
    }
    return existing[0];
  }
  const result = await db.insert(groupTravelProfiles).values({
    groupKey: "grimsley-hs-graduation-cruise-2027",
    title: "Grimsley High School Graduation Cruise 2027",
    organizationName: "Grimsley High School · The Class of 2027",
    experienceId: experience.id,
    stage: "proposal_build",
    workflowStage: "building_proposal",
    shareStatus: "draft",
    privateToken: randomBytes(32).toString("base64url"),
    groupTerms: "Group cabin requests are reviewed personally by Wendy. A cabin is not held until Wendy confirms the live quote and the household approves it.",
    roomStrategy: "Collect room count, traveler names, ages, preferred cabin style, and forward, mid ship, aft, or no preference. Wendy confirms the live cabin category, deck, and placement.",
    bookingWindow: "Link is ready to share after Wendy confirms the current group details and family request window.",
    advisorNotes: "Review group rates and booking deadline before sharing the private family link.",
  });
  return (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, Number(result[0].insertId))).limit(1))[0];
}

export async function getGroupTravelProfile(groupKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const profile = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.groupKey, groupKey)).limit(1))[0];
  if (!profile) return undefined;
  const [experience, cabinRequests] = await Promise.all([
    db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, profile.experienceId)).limit(1),
    getGroupCabinRequests(profile.groupKey),
  ]);
  return { profile, experience: experience[0], cabinRequests };
}

export async function updateGroupTravelProfile(id: number, input: {
  experienceId?: number;
  stage: GroupProfileStage;
  shareStatus: GroupProfileShareStatus;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  groupTerms?: string;
  roomStrategy?: string;
  bookingWindow?: string;
  advisorNotes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const current = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
  if (!current) throw new Error("Group profile not found");
  const shareStatus = input.shareStatus === "shared" && current.shareStatus !== "shared" ? current.shareStatus : input.shareStatus;
  await db.update(groupTravelProfiles).set({
    stage: input.stage,
    experienceId: input.experienceId || current.experienceId,
    shareStatus,
    coordinatorName: input.coordinatorName || null,
    coordinatorEmail: input.coordinatorEmail || null,
    coordinatorPhone: input.coordinatorPhone || null,
    groupTerms: input.groupTerms || null,
    roomStrategy: input.roomStrategy || null,
    bookingWindow: input.bookingWindow || null,
    advisorNotes: input.advisorNotes || null,
  }).where(eq(groupTravelProfiles.id, id));
}

export async function saveGroupWorkflowDetails(id: number, input: { experienceId?: number; coordinatorName?: string; coordinatorEmail?: string; coordinatorPhone?: string; groupTerms?: string; roomStrategy?: string; bookingWindow?: string; advisorNotes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const current = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
  if (!current) throw new Error("Group profile not found");
  await db.update(groupTravelProfiles).set({ experienceId: input.experienceId || current.experienceId, coordinatorName: input.coordinatorName ?? current.coordinatorName, coordinatorEmail: input.coordinatorEmail ?? current.coordinatorEmail, coordinatorPhone: input.coordinatorPhone ?? current.coordinatorPhone, groupTerms: input.groupTerms ?? current.groupTerms, roomStrategy: input.roomStrategy ?? current.roomStrategy, bookingWindow: input.bookingWindow ?? current.bookingWindow, advisorNotes: input.advisorNotes ?? current.advisorNotes }).where(eq(groupTravelProfiles.id, id));
}

export async function advanceGroupWorkflow(id: number, actorUserId: number, input: { nextAction?: string; meetingAt?: Date; meetingNotes?: string; experienceId?: number; reservationReference?: string; stageData?: Record<string, string> }) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const current = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
  if (!current) throw new Error("Group profile not found");
  const fromStage = current.workflowStage as WorkflowStage;
  const toStage = nextWorkflowStage(fromStage);
  if (!toStage) throw new Error("This group is already at its final workflow stage.");
  validateTransition(fromStage, toStage, input);
  if (fromStage === "building_proposal" && (!current.groupTerms || !current.roomStrategy || !current.bookingWindow)) throw new Error("Complete group terms, room strategy, and family request window before sharing.");
  if (fromStage === "family_details") {
    const requests = await getGroupCabinRequests(current.groupKey);
    if (!requests.length) throw new Error("Wait for at least one family response before requesting live quotes.");
  }
  const stageDataJson = mergeStageData(current.stageDataJson, fromStage, input.stageData || {});
  await db.update(groupTravelProfiles).set({ workflowStage: toStage, stage: groupStageForWorkflow[toStage], experienceId: input.experienceId || current.experienceId, advisorNotes: input.meetingNotes || current.advisorNotes, stageDataJson }).where(eq(groupTravelProfiles.id, id));
  await writeWorkflowStageEvent({ entityType: "group", entityId: id, fromStage, toStage, action: "continue", snapshot: input.stageData, actorUserId });
  return (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
}

export async function reopenGroupWorkflow(id: number, actorUserId: number, toStage: WorkflowStage, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const current = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
  if (!current) throw new Error("Group profile not found");
  const fromStage = current.workflowStage as WorkflowStage;
  if (workflowStages.indexOf(toStage) >= workflowStages.indexOf(fromStage)) throw new Error("Choose a completed prior stage to reopen.");
  await db.update(groupTravelProfiles).set({ workflowStage: toStage, stage: groupStageForWorkflow[toStage] }).where(eq(groupTravelProfiles.id, id));
  await writeWorkflowStageEvent({ entityType: "group", entityId: id, fromStage, toStage, action: "reopen", reason, actorUserId });
}

export async function shareGroupTravelProfile(id: number, validForDays: number, actorUserId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const current = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
  if (!current) throw new Error("Group profile not found");
  if (current.workflowStage !== "proposal_shared" && current.shareStatus !== "shared") throw new Error("Complete the Proposal shared stage before creating a family link.");
  await db.update(groupTravelProfiles).set({ shareStatus: "shared", stage: "family_details", workflowStage: "family_details", expiresAt: new Date(Date.now() + validForDays * 24 * 60 * 60 * 1000) }).where(eq(groupTravelProfiles.id, id));
  await writeWorkflowStageEvent({ entityType: "group", entityId: id, fromStage: current.workflowStage as WorkflowStage, toStage: "family_details", action: "family_link_activated", actorUserId });
  return (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.id, id)).limit(1))[0];
}

export async function getPrivateGroupTravelProfile(privateToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Group profile storage is unavailable");
  const profile = (await db.select().from(groupTravelProfiles).where(eq(groupTravelProfiles.privateToken, privateToken)).limit(1))[0];
  if (!profile || profile.shareStatus !== "shared" || (profile.expiresAt && profile.expiresAt.getTime() < Date.now())) return undefined;
  const experience = (await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, profile.experienceId)).limit(1))[0];
  return experience ? { profile, experience } : undefined;
}

export type CreateAdvisorDealInput = {
  sourceType: "manual" | "trip_inquiry" | "group_cabin_request";
  sourceId?: number;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  title: string;
  travelSummary?: string;
  stage: WorkflowStage;
  experienceId?: number;
  nextAction?: string;
  meetingAt?: Date;
  meetingNotes?: string;
  advisorNotes?: string;
};

export async function createAdvisorDeal(input: CreateAdvisorDealInput) {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  const result = await db.insert(advisorDeals).values({
    ...input,
    sourceId: input.sourceId || null,
    experienceId: input.experienceId || null,
    travelSummary: input.travelSummary || null,
    nextAction: input.nextAction || null,
    meetingAt: input.meetingAt || null,
    meetingNotes: input.meetingNotes || null,
    advisorNotes: input.advisorNotes || null,
  });
  return { id: Number(result[0].insertId) };
}

export async function updateAdvisorDeal(id: number, input: Pick<CreateAdvisorDealInput, "stage" | "experienceId" | "nextAction" | "meetingAt" | "meetingNotes" | "advisorNotes"> & { reservationReference?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  await db.update(advisorDeals).set({
    stage: input.stage,
    experienceId: input.experienceId || null,
    nextAction: input.nextAction || null,
    meetingAt: input.meetingAt || null,
    meetingNotes: input.meetingNotes || null,
    advisorNotes: input.advisorNotes || null,
    reservationReference: input.reservationReference || null,
  }).where(eq(advisorDeals.id, id));
}

export async function advanceAdvisorDealWorkflow(id: number, actorUserId: number, input: { nextAction?: string; meetingAt?: Date; meetingNotes?: string; advisorNotes?: string; reservationReference?: string; experienceId?: number; stageData?: Record<string, string> }) {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  const current = (await db.select().from(advisorDeals).where(eq(advisorDeals.id, id)).limit(1))[0];
  if (!current) throw new Error("Client deal not found");
  const fromStage = current.stage as WorkflowStage;
  const toStage = nextWorkflowStage(fromStage);
  if (!toStage) throw new Error("This client is already at its final workflow stage.");
  validateTransition(fromStage, toStage, input);
  const stageDataJson = mergeStageData(current.stageDataJson, fromStage, input.stageData || {});
  await db.update(advisorDeals).set({ stage: toStage, experienceId: input.experienceId || current.experienceId, nextAction: input.nextAction || current.nextAction, meetingAt: input.meetingAt || current.meetingAt, meetingNotes: input.meetingNotes || current.meetingNotes, advisorNotes: input.advisorNotes || current.advisorNotes, reservationReference: input.reservationReference || current.reservationReference, stageDataJson }).where(eq(advisorDeals.id, id));
  await writeWorkflowStageEvent({ entityType: "deal", entityId: id, fromStage, toStage, action: "continue", snapshot: input.stageData, actorUserId });
  return (await db.select().from(advisorDeals).where(eq(advisorDeals.id, id)).limit(1))[0];
}

export async function reopenAdvisorDealWorkflow(id: number, actorUserId: number, toStage: WorkflowStage, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  const current = (await db.select().from(advisorDeals).where(eq(advisorDeals.id, id)).limit(1))[0];
  if (!current) throw new Error("Client deal not found");
  const fromStage = current.stage as WorkflowStage;
  if (workflowStages.indexOf(toStage) >= workflowStages.indexOf(fromStage)) throw new Error("Choose a completed prior stage to reopen.");
  await db.update(advisorDeals).set({ stage: toStage }).where(eq(advisorDeals.id, id));
  await writeWorkflowStageEvent({ entityType: "deal", entityId: id, fromStage, toStage, action: "reopen", reason, actorUserId });
}

export async function listAdvisorDeals() {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  return db.select().from(advisorDeals).orderBy(desc(advisorDeals.updatedAt)).limit(150);
}

export async function syncExistingRequestsToAdvisorDeals() {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  const [existingDeals, legacyInquiries, legacyGroupRequests] = await Promise.all([
    db.select({ sourceType: advisorDeals.sourceType, sourceId: advisorDeals.sourceId }).from(advisorDeals),
    db.select().from(tripInquiries).orderBy(desc(tripInquiries.createdAt)).limit(150),
    db.select().from(groupCabinRequests).orderBy(desc(groupCabinRequests.createdAt)).limit(150),
  ]);
  const existingSources = new Set(existingDeals.filter((deal) => deal.sourceId !== null).map((deal) => `${deal.sourceType}:${deal.sourceId}`));
  const values = [
    ...legacyInquiries.filter((inquiry) => !existingSources.has(`trip_inquiry:${inquiry.id}`)).map((inquiry) => ({
      sourceType: "trip_inquiry" as const, sourceId: inquiry.id, contactFirstName: inquiry.firstName, contactLastName: inquiry.lastName, email: inquiry.email, phone: inquiry.phone, title: `${inquiry.travelType} travel inquiry`, travelSummary: `Destinations: ${inquiry.destinations}. Timing: ${inquiry.travelTiming}. Travelers: ${inquiry.groupSize}. ${inquiry.priorities || ""}`, stage: "new_inquiry" as const, nextAction: "Review inquiry and schedule discovery call",
    })),
    ...legacyGroupRequests.filter((request) => !existingSources.has(`group_cabin_request:${request.id}`)).map((request) => ({
      sourceType: "group_cabin_request" as const, sourceId: request.id, contactFirstName: request.contactFirstName, contactLastName: request.contactLastName, email: request.email, phone: request.phone, title: "Grimsley High School Graduation Cruise 2027", travelSummary: `${request.roomCount} requested rooms. ${request.notes || ""}`, stage: "new_inquiry" as const, nextAction: "Review school cruise cabin request and prepare quote",
    })),
  ];
  if (values.length) await db.insert(advisorDeals).values(values);
  return { added: values.length };
}

export type CreateClientProposalInput = {
  dealId: number;
  experienceId?: number;
  title: string;
  privateToken: string;
  summary?: string;
  roomGuidance?: string;
  pricingSummary?: string;
  expiresAt?: Date;
};

export async function createClientProposal(input: CreateClientProposalInput) {
  const db = await getDb();
  if (!db) throw new Error("Client proposal storage is unavailable");
  const result = await db.insert(clientProposals).values({
    ...input,
    experienceId: input.experienceId || null,
    summary: input.summary || null,
    roomGuidance: input.roomGuidance || null,
    pricingSummary: input.pricingSummary || null,
    expiresAt: input.expiresAt || null,
  });
  return { id: Number(result[0].insertId) };
}

export async function listClientProposals() {
  const db = await getDb();
  if (!db) throw new Error("Client proposal storage is unavailable");
  return db.select().from(clientProposals).orderBy(desc(clientProposals.updatedAt)).limit(200);
}

export async function markClientProposalShared(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Client proposal storage is unavailable");
  await db.update(clientProposals).set({ status: "shared", sentAt: new Date() }).where(eq(clientProposals.id, id));
}

export async function getPrivateClientProposal(privateToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Client proposal storage is unavailable");
  const proposals = await db.select().from(clientProposals).where(eq(clientProposals.privateToken, privateToken)).limit(1);
  const proposal = proposals[0];
  if (!proposal || !["shared", "response_received", "quoted", "booked"].includes(proposal.status) || proposal.status === "expired" || (proposal.expiresAt && proposal.expiresAt.getTime() < Date.now())) return undefined;
  const experience = proposal.experienceId ? (await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, proposal.experienceId)).limit(1))[0] : undefined;
  return { proposal, experience };
}

export type CreateProposalResponseInput = {
  proposalId: number;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  roomsJson: string;
  notes?: string;
};

export async function createProposalResponse(input: CreateProposalResponseInput) {
  const db = await getDb();
  if (!db) throw new Error("Proposal response storage is unavailable");
  const result = await db.insert(proposalResponses).values({ ...input, notes: input.notes || null });
  await db.update(clientProposals).set({ status: "response_received" }).where(eq(clientProposals.id, input.proposalId));
  return { id: Number(result[0].insertId) };
}

export async function listProposalResponses() {
  const db = await getDb();
  if (!db) throw new Error("Proposal response storage is unavailable");
  return db.select().from(proposalResponses).orderBy(desc(proposalResponses.createdAt)).limit(200);
}

export async function updateProposalResponseStatus(id: number, status: "new" | "reviewed" | "quoted" | "closed") {
  const db = await getDb();
  if (!db) throw new Error("Proposal response storage is unavailable");
  await db.update(proposalResponses).set({ status }).where(eq(proposalResponses.id, id));
}
