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
  loyaltyNumber: varchar("loyaltyNumber", { length: 100 }),
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
