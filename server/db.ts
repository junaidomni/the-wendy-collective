import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  groupCabinRequestRooms,
  groupCabinRequestTravelers,
  groupCabinRequests,
  InsertPrivateClientRequest,
  InsertTripInquiry,
  InsertUser,
  privateClientRequests,
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
