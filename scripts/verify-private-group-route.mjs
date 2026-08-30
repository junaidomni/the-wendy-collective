import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for private-route verification.");

const db = await mysql.createConnection(databaseUrl);
let exitCode = 0;
try {
  const [rows] = await db.execute(
    "SELECT privateToken FROM group_travel_profiles WHERE groupKey = ? LIMIT 1",
    ["grimsley-hs-graduation-cruise-2027"],
  );
  const token = rows[0]?.privateToken;
  if (!token) throw new Error("No active Grimsley token was found.");
  const response = await fetch(`https://thewendycollective.com/group/${encodeURIComponent(token)}`, { redirect: "follow" });
  const html = await response.text();
  const result = {
    status: response.status,
    servedMaintenancePage: html.includes("Site under maintenance"),
    hasPrivateNoindex: /name="robots" content="noindex, follow"/.test(html),
  };
  console.log(JSON.stringify(result));
  if (result.status !== 200 || result.servedMaintenancePage || !result.hasPrivateNoindex) exitCode = 1;
} finally {
  await db.end();
}
process.exit(exitCode);
