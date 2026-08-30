import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tripInquiries = mysqlTable("trip_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 80 }).notNull(),
  lastName: varchar("lastName", { length: 80 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  travelType: varchar("travelType", { length: 40 }).notNull(),
  destinations: text("destinations").notNull(),
  travelTiming: varchar("travelTiming", { length: 120 }).notNull(),
  dateFlexibility: varchar("dateFlexibility", { length: 24 }).notNull(),
  budget: varchar("budget", { length: 120 }).notNull(),
  groupSize: int("groupSize").notNull(),
  priorities: text("priorities"),
  status: mysqlEnum("status", ["new", "reviewed", "planned"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const privateClientRequests = mysqlTable("private_client_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  requestType: mysqlEnum("requestType", ["itinerary", "documents", "question", "support"]).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groupCabinRequests = mysqlTable("group_cabin_requests", {
  id: int("id").autoincrement().primaryKey(),
  groupKey: varchar("groupKey", { length: 120 }).notNull(),
  contactFirstName: varchar("contactFirstName", { length: 80 }).notNull(),
  contactLastName: varchar("contactLastName", { length: 80 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  roomCount: int("roomCount").notNull(),
  amenitiesJson: text("amenitiesJson"),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "contacted", "details_received", "quote_in_progress", "quote_shared", "booked", "closed"]).default("new").notNull(),
  advisorNotes: text("advisorNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const groupCabinRequestRooms = mysqlTable("group_cabin_request_rooms", {
  id: int("id").autoincrement().primaryKey(),
  cabinRequestId: int("cabinRequestId").notNull(),
  roomNumber: int("roomNumber").notNull(),
  occupancy: int("occupancy").notNull(),
  roomType: varchar("roomType", { length: 40 }).notNull(),
  locationPreference: varchar("locationPreference", { length: 40 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groupCabinRequestTravelers = mysqlTable("group_cabin_request_travelers", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  firstName: varchar("firstName", { length: 80 }).notNull(),
  middleName: varchar("middleName", { length: 80 }),
  lastName: varchar("lastName", { length: 80 }).notNull(),
  age: int("age").notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }),
  loyaltyNumber: varchar("loyaltyNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cruiseExperiences = mysqlTable("cruise_experiences", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  groupName: varchar("groupName", { length: 180 }),
  cruiseLine: varchar("cruiseLine", { length: 120 }).notNull(),
  shipName: varchar("shipName", { length: 160 }).notNull(),
  embarkPort: varchar("embarkPort", { length: 160 }).notNull(),
  sailingSummary: varchar("sailingSummary", { length: 180 }).notNull(),
  heroImageUrl: text("heroImageUrl"),
  heroImageAlt: varchar("heroImageAlt", { length: 240 }),
  publicSummary: text("publicSummary"),
  itineraryJson: text("itineraryJson"),
  roomGuidance: text("roomGuidance"),
  shipFactsJson: text("shipFactsJson"),
  cabinCategoriesJson: text("cabinCategoriesJson"),
  amenitiesJson: text("amenitiesJson"),
  sourceReference: text("sourceReference"),
  reviewedOn: varchar("reviewedOn", { length: 10 }),
  status: mysqlEnum("status", ["draft", "ready", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const groupTravelProfiles = mysqlTable("group_travel_profiles", {
  id: int("id").autoincrement().primaryKey(),
  groupKey: varchar("groupKey", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  organizationName: varchar("organizationName", { length: 180 }).notNull(),
  coordinatorName: varchar("coordinatorName", { length: 160 }),
  coordinatorEmail: varchar("coordinatorEmail", { length: 320 }),
  coordinatorPhone: varchar("coordinatorPhone", { length: 40 }),
  experienceId: int("experienceId").notNull(),
  stage: mysqlEnum("stage", ["group_setup", "proposal_build", "ready_to_share", "family_details", "live_quote", "booking", "booked", "closed"]).default("group_setup").notNull(),
  shareStatus: mysqlEnum("shareStatus", ["draft", "shared", "paused", "closed"]).default("draft").notNull(),
  privateToken: varchar("privateToken", { length: 96 }).notNull().unique(),
  expiresAt: timestamp("expiresAt"),
  groupTerms: text("groupTerms"),
  roomStrategy: text("roomStrategy"),
  bookingWindow: text("bookingWindow"),
  advisorNotes: text("advisorNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const advisorDeals = mysqlTable("advisor_deals", {
  id: int("id").autoincrement().primaryKey(),
  sourceType: mysqlEnum("sourceType", ["manual", "trip_inquiry", "group_cabin_request"]).default("manual").notNull(),
  sourceId: int("sourceId"),
  contactFirstName: varchar("contactFirstName", { length: 80 }).notNull(),
  contactLastName: varchar("contactLastName", { length: 80 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  travelSummary: text("travelSummary"),
  stage: mysqlEnum("stage", ["new_inquiry", "discovery_call", "building_proposal", "proposal_shared", "ready_to_book", "booked", "closed"]).default("new_inquiry").notNull(),
  experienceId: int("experienceId"),
  nextAction: text("nextAction"),
  meetingAt: timestamp("meetingAt"),
  meetingNotes: text("meetingNotes"),
  advisorNotes: text("advisorNotes"),
  reservationReference: varchar("reservationReference", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clientProposals = mysqlTable("client_proposals", {
  id: int("id").autoincrement().primaryKey(),
  dealId: int("dealId").notNull(),
  experienceId: int("experienceId"),
  title: varchar("title", { length: 180 }).notNull(),
  privateToken: varchar("privateToken", { length: 96 }).notNull().unique(),
  summary: text("summary"),
  roomGuidance: text("roomGuidance"),
  pricingSummary: text("pricingSummary"),
  status: mysqlEnum("status", ["draft", "shared", "response_received", "quoted", "booked", "expired"]).default("draft").notNull(),
  expiresAt: timestamp("expiresAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const proposalResponses = mysqlTable("proposal_responses", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  contactFirstName: varchar("contactFirstName", { length: 80 }).notNull(),
  contactLastName: varchar("contactLastName", { length: 80 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  roomsJson: text("roomsJson").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "reviewed", "quoted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type TripInquiry = typeof tripInquiries.$inferSelect;
export type InsertTripInquiry = typeof tripInquiries.$inferInsert;
export type PrivateClientRequest = typeof privateClientRequests.$inferSelect;
export type InsertPrivateClientRequest = typeof privateClientRequests.$inferInsert;
export type GroupCabinRequest = typeof groupCabinRequests.$inferSelect;
export type InsertGroupCabinRequest = typeof groupCabinRequests.$inferInsert;
export type GroupCabinRequestRoom = typeof groupCabinRequestRooms.$inferSelect;
export type InsertGroupCabinRequestRoom = typeof groupCabinRequestRooms.$inferInsert;
export type GroupCabinRequestTraveler = typeof groupCabinRequestTravelers.$inferSelect;
export type InsertGroupCabinRequestTraveler = typeof groupCabinRequestTravelers.$inferInsert;
export type CruiseExperience = typeof cruiseExperiences.$inferSelect;
export type InsertCruiseExperience = typeof cruiseExperiences.$inferInsert;
export type AdvisorDeal = typeof advisorDeals.$inferSelect;
export type InsertAdvisorDeal = typeof advisorDeals.$inferInsert;
export type ClientProposal = typeof clientProposals.$inferSelect;
export type InsertClientProposal = typeof clientProposals.$inferInsert;
export type ProposalResponse = typeof proposalResponses.$inferSelect;
export type InsertProposalResponse = typeof proposalResponses.$inferInsert;
