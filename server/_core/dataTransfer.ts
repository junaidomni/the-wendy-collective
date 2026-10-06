// Database + file migration helpers shared by scripts/export-manus-db.ts,
// scripts/import-db.ts, scripts/copy-storage-to-s3.ts and the optional
// admin data-export endpoint. Pure functions are unit tested.
import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";

export const DUMP_FORMAT = "twc-db-dump/v1" as const;

export type DumpTable = { name: string; rowCount: number; columns: string[]; createTable: string };
export type DumpManifest = {
  format: typeof DUMP_FORMAT;
  createdAt: string;
  source: { host: string; database: string };
  tables: DumpTable[];
};
export type EncodedValue = string | number | boolean | null | { $b64: string };
export type DumpFile = { manifest: DumpManifest; data: Record<string, Record<string, EncodedValue>[]> };

// ---------------------------------------------------------------------------
// Connection helpers
// ---------------------------------------------------------------------------

/** host + database of a mysql:// URL with credentials removed (safe to log). */
export function describeDatabaseUrl(url: string): { host: string; database: string } {
  try {
    const parsed = new URL(url);
    return { host: `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`, database: decodeURIComponent(parsed.pathname.replace(/^\//, "")) };
  } catch {
    return { host: "invalid-url", database: "" };
  }
}

export function sameDatabase(a: string, b: string): boolean {
  const left = describeDatabaseUrl(a);
  const right = describeDatabaseUrl(b);
  return left.host.toLowerCase() === right.host.toLowerCase() && left.database === right.database;
}

/** Manus web-db-user projects run on TiDB Cloud. Used to stop imports into it. */
export function looksLikeManusDatabase(url: string): boolean {
  return /tidbcloud\.com(:\d+)?$/i.test(describeDatabaseUrl(url).host);
}

export async function connectMysql(url: string): Promise<Connection> {
  const parsed = new URL(url);
  const wantsSsl = parsed.searchParams.has("ssl") || process.env.DB_SSL === "1" || looksLikeManusDatabase(url);
  // mysql2 parses ?ssl={...} from the URI; strip it and pass explicitly so a
  // bare `?ssl=true` also works.
  parsed.searchParams.delete("ssl");
  const connection = await mysql.createConnection({
    uri: parsed.toString(),
    // Keep DATE/DATETIME/TIMESTAMP as the exact strings the server returns so
    // nothing is shifted by the Node process timezone.
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    timezone: "Z",
    multipleStatements: false,
    ...(wantsSsl ? { ssl: { rejectUnauthorized: true, minVersion: "TLSv1.2" } } : {}),
  });
  await connection.query("SET time_zone = '+00:00'");
  return connection;
}

const READ_ONLY_STATEMENT = /^\s*(select|show|set\s+(session\s+)?(time_zone|transaction)|start\s+transaction|rollback)\b/i;

/** Guard used on the SOURCE connection: anything but a read is refused. */
export function assertReadOnlyStatement(statement: string) {
  if (!READ_ONLY_STATEMENT.test(statement)) throw new Error(`Refusing non read-only statement on source database: ${statement.slice(0, 60)}`);
}

export const quoteIdent = (name: string) => `\`${name.replace(/`/g, "``")}\``;

// ---------------------------------------------------------------------------
// Value encoding (JSON-safe, lossless for the column types this app uses)
// ---------------------------------------------------------------------------

export function encodeValue(value: unknown): EncodedValue {
  if (value === null || value === undefined) return null;
  if (Buffer.isBuffer(value)) return { $b64: value.toString("base64") };
  if (value instanceof Date) return value.toISOString().replace("T", " ").replace("Z", "");
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") return JSON.stringify(value); // JSON columns come back parsed
  return value as string | number | boolean;
}

export function decodeValue(value: EncodedValue): string | number | boolean | null | Buffer {
  if (value && typeof value === "object" && "$b64" in value) return Buffer.from(value.$b64, "base64");
  return value as string | number | boolean | null;
}

export type UrlRewrite = { from: string; to: string };

/** Parses REWRITE_URLS="https://old.example=>https://new.example,https://x=>" */
export function parseRewrites(spec: string | undefined): UrlRewrite[] {
  if (!spec) return [];
  return spec.split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
    const [from, to = ""] = part.split("=>");
    if (!from) throw new Error(`Invalid rewrite rule: ${part}`);
    return { from: from.trim(), to: to.trim() };
  });
}

export function applyRewrites(value: EncodedValue, rewrites: UrlRewrite[]): EncodedValue {
  if (typeof value !== "string" || rewrites.length === 0) return value;
  return rewrites.reduce((current, rule) => current.split(rule.from).join(rule.to), value);
}

// ---------------------------------------------------------------------------
// Storage key discovery
// ---------------------------------------------------------------------------

const STORAGE_PATH = /\/manus-storage\/([A-Za-z0-9._~%+@-][A-Za-z0-9._~%+@/-]*)/g;

/** All storage keys referenced as /manus-storage/{key} (relative or absolute URLs). */
export function extractStorageKeys(text: string): string[] {
  const keys = new Set<string>();
  for (const match of Array.from(text.matchAll(STORAGE_PATH))) {
    let key = match[1].replace(/[.,;:!]+$/, "").replace(/\/+$/, "");
    try { key = decodeURIComponent(key); } catch { /* keep raw */ }
    if (key) keys.add(key);
  }
  return Array.from(keys);
}

const OTHER_MANUS_URL = /https?:\/\/[A-Za-z0-9.-]*(manuscdn\.com|manus\.space|manus\.im|manus\.computer|butterfly-effect\.dev)[^\s"'<>)]*/gi;

/** Manus-hosted absolute URLs that are NOT /manus-storage paths (need manual review). */
export function findOtherManusUrls(text: string): string[] {
  return Array.from(new Set(Array.from(text.matchAll(OTHER_MANUS_URL)).map((m) => m[0]).filter((url) => !url.includes("/manus-storage/"))));
}

// ---------------------------------------------------------------------------
// Dump (read-only on the source)
// ---------------------------------------------------------------------------

async function readOnly<T extends RowDataPacket[]>(connection: Connection, statement: string): Promise<T> {
  assertReadOnlyStatement(statement);
  const [rows] = await connection.query<T>(statement);
  return rows;
}

export async function dumpDatabase(connection: Connection, sourceUrl: string, log: (message: string) => void = () => {}): Promise<DumpFile> {
  // Belt and braces: the statement guard above already refuses writes. The
  // server-side READ ONLY flag is applied where supported (TiDB treats it as
  // a "noop function" and may reject it, so fall back gracefully).
  try { await connection.query("SET SESSION TRANSACTION READ ONLY"); } catch { /* TiDB noop */ }
  for (const statement of ["START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY", "START TRANSACTION WITH CONSISTENT SNAPSHOT", "START TRANSACTION"]) {
    try { await connection.query(statement); break; } catch (error) { if (statement === "START TRANSACTION") throw error; }
  }
  try {
    const tableRows = await readOnly<RowDataPacket[]>(connection, "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const names = tableRows.map((row) => String(Object.values(row)[0])).sort();
    const manifest: DumpManifest = { format: DUMP_FORMAT, createdAt: new Date().toISOString(), source: describeDatabaseUrl(sourceUrl), tables: [] };
    const data: DumpFile["data"] = {};
    for (const name of names) {
      const [create] = await readOnly<RowDataPacket[]>(connection, `SHOW CREATE TABLE ${quoteIdent(name)}`);
      const columnRows = await readOnly<RowDataPacket[]>(connection, `SHOW COLUMNS FROM ${quoteIdent(name)}`);
      const rows = await readOnly<RowDataPacket[]>(connection, `SELECT * FROM ${quoteIdent(name)}`);
      const columns = columnRows.map((column) => String(column.Field));
      data[name] = rows.map((row) => Object.fromEntries(columns.map((column) => [column, encodeValue(row[column])])));
      manifest.tables.push({ name, rowCount: rows.length, columns, createTable: String(create["Create Table"]) });
      log(`  ${name}: ${rows.length} rows`);
    }
    return { manifest, data };
  } finally {
    await connection.query("ROLLBACK");
  }
}

export function validateDump(dump: DumpFile) {
  if (dump?.manifest?.format !== DUMP_FORMAT) throw new Error(`Not a ${DUMP_FORMAT} file`);
  for (const table of dump.manifest.tables) {
    const rows = dump.data[table.name];
    if (!Array.isArray(rows)) throw new Error(`Dump is missing rows for ${table.name}`);
    if (rows.length !== table.rowCount) throw new Error(`Dump is inconsistent for ${table.name}: manifest ${table.rowCount}, rows ${rows.length}`);
  }
}

// ---------------------------------------------------------------------------
// Import (idempotent)
// ---------------------------------------------------------------------------

export type ImportMode = "upsert" | "mirror";
export type TableResult = { name: string; expected: number; actual: number; ok: boolean };

/** Makes a CREATE TABLE statement idempotent and portable from TiDB to MySQL. */
export function portableCreateTable(statement: string): string {
  return statement
    .replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ")
    .replace(/\/\*T!\[[^\]]*\][^*]*\*\//g, "") // TiDB-only feature comments
    .replace(/\s+AUTO_ID_CACHE=\d+/gi, "")
    .replace(/\s+AUTO_INCREMENT=\d+/gi, "");
}

export function buildInsert(table: string, columns: string[], rowCount: number, mode: ImportMode): string {
  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  const base = `INSERT INTO ${quoteIdent(table)} (${columns.map(quoteIdent).join(", ")}) VALUES ${Array.from({ length: rowCount }, () => placeholders).join(", ")}`;
  if (mode === "mirror") return base;
  return `${base} ON DUPLICATE KEY UPDATE ${columns.map((column) => `${quoteIdent(column)} = VALUES(${quoteIdent(column)})`).join(", ")}`;
}

export async function importDump(connection: Connection, dump: DumpFile, options: { mode: ImportMode; rewrites: UrlRewrite[]; batchSize?: number; log?: (message: string) => void }): Promise<TableResult[]> {
  validateDump(dump);
  const log = options.log ?? (() => {});
  const batchSize = options.batchSize ?? 200;
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  const results: TableResult[] = [];
  try {
    for (const table of dump.manifest.tables) {
      await connection.query(portableCreateTable(table.createTable));
      const [existing] = await connection.query<RowDataPacket[]>(`SHOW COLUMNS FROM ${quoteIdent(table.name)}`);
      const targetColumns = existing.map((column) => String(column.Field));
      const missing = table.columns.filter((column) => !targetColumns.includes(column));
      if (missing.length) throw new Error(`Target table ${table.name} is missing columns ${missing.join(", ")}; drop it or migrate the target schema first`);

      await connection.beginTransaction();
      try {
        if (options.mode === "mirror") await connection.query(`DELETE FROM ${quoteIdent(table.name)}`);
        const rows = dump.data[table.name];
        for (let offset = 0; offset < rows.length; offset += batchSize) {
          const batch = rows.slice(offset, offset + batchSize);
          const params = batch.flatMap((row) => table.columns.map((column) => decodeValue(applyRewrites(row[column] ?? null, options.rewrites))));
          await connection.query(buildInsert(table.name, table.columns, batch.length, options.mode), params);
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      const [[count]] = await connection.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${quoteIdent(table.name)}`);
      const actual = Number(count.n);
      results.push({ name: table.name, expected: table.rowCount, actual, ok: actual === table.rowCount });
      log(`  ${actual === table.rowCount ? "OK " : "MISMATCH"} ${table.name}: source ${table.rowCount}, target ${actual}`);
    }
  } finally {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  }
  return results;
}
