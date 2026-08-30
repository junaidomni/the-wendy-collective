import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for private-link inspection.");

const db = await mysql.createConnection(databaseUrl);
try {
  const [rows] = await db.execute(
    "SELECT privateToken FROM group_travel_profiles WHERE groupKey = ? LIMIT 1",
    ["grimsley-hs-graduation-cruise-2027"],
  );
  const token = rows[0]?.privateToken;
  if (!token) throw new Error("No active Grimsley link was found.");
  const response = await fetch(`https://thewendycollective.com/group/${encodeURIComponent(token)}`, { redirect: "follow" });
  const html = await response.text();
  const match = (pattern) => html.match(pattern)?.[1] ?? null;
  console.log(JSON.stringify({
    status: response.status,
    title: match(/<title>([^<]+)<\/title>/),
    robots: match(/<meta name="robots" content="([^"]+)"/),
    ogTitle: match(/<meta property="og:title" content="([^"]+)"/),
    ogDescription: match(/<meta property="og:description" content="([^"]+)"/),
    ogImage: match(/<meta property="og:image" content="([^"]+)"/),
    ogImageWidth: match(/<meta property="og:image:width" content="([^"]+)"/),
    ogImageHeight: match(/<meta property="og:image:height" content="([^"]+)"/),
    ogUrlPresent: /<meta property="og:url"/.test(html),
  }));
} finally {
  await db.end();
}
process.exit(0);
