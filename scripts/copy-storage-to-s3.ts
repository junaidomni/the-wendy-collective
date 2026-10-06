/**
 * Copies every stored file the site references from Manus storage to the new
 * S3-compatible bucket, keeping the SAME object keys. The self-hosted app keeps
 * serving them at /manus-storage/{key}, so stored URLs do not need rewriting.
 *
 *   S3_ENDPOINT=... S3_BUCKET=... S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... \
 *   SOURCE_STORAGE_ORIGIN=https://wendytravel-g2nn4krv.manus.space \
 *     pnpm tsx scripts/copy-storage-to-s3.ts --dump exports/manus-db-....json [--keys extra-keys.txt] [--dry-run]
 *
 * Key discovery: /manus-storage/... references in the DB dump + the repo source
 * (client/, server/, shared/) + an optional newline-separated keys file.
 * Download: plain GET of the live site's public /manus-storage/{key} route,
 * which 307-redirects to a signed URL. Read-only for Manus; no credentials.
 * Idempotent: keys already present in the bucket are skipped.
 * Ends with a HEAD check of every key; exit 1 if anything is missing.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { extractStorageKeys, findOtherManusUrls } from "../server/_core/dataTransfer";
import { s3ObjectExists, s3PutObject } from "../server/_core/s3Storage";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIRS = ["client", "server", "shared"];
const SOURCE_EXT = /\.(tsx?|jsx?|css|html|json|md)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXT.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function pool<T>(items: T[], size: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (index < items.length) await worker(items[index++]);
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const dryRun = args.includes("--dry-run");
  const origin = (process.env.SOURCE_STORAGE_ORIGIN ?? "https://wendytravel-g2nn4krv.manus.space").replace(/\/+$/, "");

  const keys = new Set<string>();
  const otherUrls = new Set<string>();
  const dumpFile = option("--dump");
  if (dumpFile) {
    const text = fs.readFileSync(dumpFile, "utf8");
    extractStorageKeys(text).forEach((key) => keys.add(key));
    findOtherManusUrls(text).forEach((url) => otherUrls.add(url));
  } else {
    console.warn("No --dump given: only keys referenced in source code will be copied (uploaded files in the DB will be missed)");
  }
  for (const file of SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))) {
    extractStorageKeys(fs.readFileSync(file, "utf8")).forEach((key) => keys.add(key));
  }
  const keysFile = option("--keys");
  if (keysFile) fs.readFileSync(keysFile, "utf8").split(/\r?\n/).map((k) => k.trim().replace(/^\/?manus-storage\//, "")).filter(Boolean).forEach((key) => keys.add(key));

  const all = Array.from(keys).sort();
  console.log(`Found ${all.length} storage keys`);
  if (otherUrls.size) {
    console.warn(`Review manually: ${otherUrls.size} other Manus-hosted URL(s) in the DB that this script does not copy:`);
    otherUrls.forEach((url) => console.warn(`  ${url}`));
  }
  if (dryRun) { all.forEach((key) => console.log(`  ${key}`)); return; }

  let copied = 0, skipped = 0;
  const failed: string[] = [];
  await pool(all, 4, async (key) => {
    try {
      if (await s3ObjectExists(key)) { skipped++; return; }
      const response = await fetch(`${origin}/manus-storage/${key.split("/").map(encodeURIComponent).join("/")}`, { redirect: "follow" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = Buffer.from(await response.arrayBuffer());
      await s3PutObject(key, body, response.headers.get("content-type") ?? "application/octet-stream");
      copied++;
      console.log(`  copied ${key} (${body.length} bytes)`);
    } catch (error) {
      failed.push(key);
      console.error(`  FAILED ${key}: ${error instanceof Error ? error.message : error}`);
    }
  });

  let present = 0;
  await pool(all, 8, async (key) => { if (await s3ObjectExists(key)) present++; });
  console.log(`Copied ${copied}, already present ${skipped}, failed ${failed.length}. Verified in bucket: ${present}/${all.length}`);
  if (failed.length || present !== all.length) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
