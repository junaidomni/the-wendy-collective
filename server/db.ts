import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  advisorDeals,
  clientProposals,
  cruiseExperiences,
  groupCabinRequestRooms,
  groupCabinRequestTravelers,
  groupCabinRequests,
  InsertPrivateClientRequest,
  InsertTripInquiry,
  InsertUser,
  privateClientRequests,
  proposalResponses,
  tripInquiries,
  users,
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
  notes: string;
  rooms: Array<{
    occupancy: number;
    roomType: string;
    locationPreference: string;
    travelers: Array<{
      firstName: string;
      middleName?: string;
      lastName: string;
      age: number;
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
    });
    const roomId = Number(roomResult[0].insertId);
    await db.insert(groupCabinRequestTravelers).values(room.travelers.map((traveler) => ({
      roomId,
      firstName: traveler.firstName,
      middleName: traveler.middleName || null,
      lastName: traveler.lastName,
      age: traveler.age,
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
  if (existing[0]) return existing[0];
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
    status: "ready",
  });
  const experience = await db.select().from(cruiseExperiences).where(eq(cruiseExperiences.id, created.id)).limit(1);
  return experience[0];
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
  stage: "new_inquiry" | "discovery_call" | "building_proposal" | "proposal_shared" | "ready_to_book" | "booked" | "closed";
  experienceId?: number;
  nextAction?: string;
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
    advisorNotes: input.advisorNotes || null,
  });
  return { id: Number(result[0].insertId) };
}

export async function updateAdvisorDeal(id: number, input: Pick<CreateAdvisorDealInput, "stage" | "experienceId" | "nextAction" | "advisorNotes"> & { reservationReference?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Advisor deal storage is unavailable");
  await db.update(advisorDeals).set({
    stage: input.stage,
    experienceId: input.experienceId || null,
    nextAction: input.nextAction || null,
    advisorNotes: input.advisorNotes || null,
    reservationReference: input.reservationReference || null,
  }).where(eq(advisorDeals.id, id));
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
