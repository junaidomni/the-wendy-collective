import { randomBytes } from "node:crypto";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for private-link rotation.");

const db = await mysql.createConnection(databaseUrl);
try {
  const nextToken = randomBytes(32).toString("base64url");
  const [result] = await db.execute(
    "UPDATE group_travel_profiles SET privateToken = ?, expiresAt = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE groupKey = ? AND shareStatus = 'shared'",
    [nextToken, "grimsley-hs-graduation-cruise-2027"],
  );
  if (result.affectedRows !== 1) throw new Error("The active Grimsley link could not be rotated.");
  console.log(JSON.stringify({ rotated: true, tokenExposed: false }));
} finally {
  await db.end();
}
process.exit(0);
