/**
 * Idempotent import of a dump (from export-manus-db.ts or
 * /api/admin/data-export) into the NEW MySQL database, with row-count checks.
 *
 *   TARGET_DATABASE_URL='mysql://root:pass@host:port/railway' \
 *     pnpm tsx scripts/import-db.ts exports/manus-db-....json [--mirror] [--dry-run]
 *
 *   --mirror   delete target rows before inserting so each table is an exact
 *              copy of the dump (use for the final cutover run)
 *   default    upsert by primary key (safe to re-run; never deletes)
 *   --dry-run  validate the dump and print counts, touch nothing
 *
 *   REWRITE_URLS='https://wendytravel-g2nn4krv.manus.space/manus-storage/=>/manus-storage/'
 *              optional find=>replace rules applied to every string value
 *
 * Safety: refuses to write to the source DB, or to any TiDB Cloud host
 * (where Manus databases live) unless ALLOW_TIDB_TARGET=1.
 * Exit code 1 if any table's row count does not match the dump.
 */
import "dotenv/config";
import fs from "node:fs";
import { connectMysql, describeDatabaseUrl, importDump, looksLikeManusDatabase, parseRewrites, sameDatabase, validateDump, type DumpFile } from "../server/_core/dataTransfer";

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const mode = args.includes("--mirror") ? "mirror" : "upsert";
  const dryRun = args.includes("--dry-run");
  if (!file) throw new Error("Usage: import-db.ts <dump.json> [--mirror] [--dry-run]");

  const dump = JSON.parse(fs.readFileSync(file, "utf8")) as DumpFile;
  validateDump(dump);
  console.log(`Dump from ${dump.manifest.source.database} @ ${dump.manifest.source.host}, created ${dump.manifest.createdAt}`);
  for (const table of dump.manifest.tables) console.log(`  ${table.name}: ${table.rowCount} rows`);
  if (dryRun) return;

  const targetUrl = process.env.TARGET_DATABASE_URL;
  if (!targetUrl) throw new Error("Set TARGET_DATABASE_URL to the NEW database (DATABASE_URL is deliberately not used)");
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  if (sourceUrl && sameDatabase(sourceUrl, targetUrl)) throw new Error("TARGET_DATABASE_URL points at the source database; refusing");
  const target = describeDatabaseUrl(targetUrl);
  if (target.host === dump.manifest.source.host && target.database === dump.manifest.source.database) throw new Error("Target is the database this dump came from; refusing");
  if (looksLikeManusDatabase(targetUrl) && process.env.ALLOW_TIDB_TARGET !== "1") throw new Error("Target looks like a TiDB Cloud (Manus) database; refusing. Set ALLOW_TIDB_TARGET=1 if this really is a new database");

  const rewrites = parseRewrites(process.env.REWRITE_URLS);
  console.log(`Importing into ${target.database} @ ${target.host} (mode: ${mode}${rewrites.length ? `, ${rewrites.length} URL rewrite(s)` : ""})`);
  const connection = await connectMysql(targetUrl);
  try {
    const results = await importDump(connection, dump, { mode, rewrites, log: console.log });
    const bad = results.filter((result) => !result.ok);
    if (bad.length) {
      console.error(`Row count mismatch in ${bad.length} table(s): ${bad.map((b) => b.name).join(", ")}${mode === "upsert" ? " (target has extra rows? re-run with --mirror)" : ""}`);
      process.exitCode = 1;
    } else {
      console.log(`Verified: all ${results.length} tables match the dump row counts`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
