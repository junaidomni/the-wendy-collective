/**
 * Read-only export of every table in the Manus database to a JSON dump file.
 *
 *   SOURCE_DATABASE_URL='mysql://user:pass@host:4000/db?ssl=true' \
 *     pnpm tsx scripts/export-manus-db.ts [out-file]
 *
 * Only SELECT/SHOW statements are issued (enforced in code), inside a single
 * consistent-snapshot transaction that is rolled back at the end.
 * Output contains customer data: keep it out of git (exports/ is ignored).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { connectMysql, describeDatabaseUrl, dumpDatabase } from "../server/_core/dataTransfer";

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  if (!sourceUrl) throw new Error("Set SOURCE_DATABASE_URL to the Manus database connection string (this script never reads DATABASE_URL, to avoid surprises)");
  const outFile = path.resolve(process.argv[2] ?? `exports/manus-db-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const { host, database } = describeDatabaseUrl(sourceUrl);
  console.log(`Exporting ${database} @ ${host} (read-only)`);
  const connection = await connectMysql(sourceUrl);
  try {
    const dump = await dumpDatabase(connection, sourceUrl, console.log);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(dump), { mode: 0o600 });
    const total = dump.manifest.tables.reduce((sum, table) => sum + table.rowCount, 0);
    console.log(`Wrote ${dump.manifest.tables.length} tables / ${total} rows to ${outFile}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
