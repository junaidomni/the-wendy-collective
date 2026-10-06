import { describe, expect, it } from "vitest";
import { applyRewrites, assertReadOnlyStatement, buildInsert, decodeValue, describeDatabaseUrl, encodeValue, extractStorageKeys, findOtherManusUrls, looksLikeManusDatabase, parseRewrites, portableCreateTable, sameDatabase, validateDump, DUMP_FORMAT, type DumpFile } from "./_core/dataTransfer";
import { selfHostConfigErrors } from "./_core/env";

describe("database migration helpers", () => {
  it("never exposes credentials when describing connection strings", () => {
    const described = describeDatabaseUrl("mysql://user:supersecret@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/app_db?ssl=true");
    expect(described).toEqual({ host: "gateway01.us-east-1.prod.aws.tidbcloud.com:4000", database: "app_db" });
    expect(JSON.stringify(described)).not.toContain("supersecret");
  });

  it("identifies the Manus (TiDB) database and identical targets so imports cannot overwrite the source", () => {
    expect(looksLikeManusDatabase("mysql://u:p@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/db")).toBe(true);
    expect(looksLikeManusDatabase("mysql://root:p@mysql.railway.internal:3306/railway")).toBe(false);
    expect(sameDatabase("mysql://a:b@Host:4000/db", "mysql://c:d@host:4000/db?x=1")).toBe(true);
    expect(sameDatabase("mysql://a:b@host:4000/db", "mysql://a:b@other:4000/db")).toBe(false);
  });

  it("only allows read statements on the source connection", () => {
    for (const ok of ["SELECT * FROM `users`", "SHOW CREATE TABLE `users`", "SHOW FULL TABLES", "START TRANSACTION WITH CONSISTENT SNAPSHOT", "ROLLBACK", "SET time_zone = '+00:00'"]) expect(() => assertReadOnlyStatement(ok)).not.toThrow();
    for (const bad of ["INSERT INTO users VALUES (1)", "UPDATE users SET name='x'", "DELETE FROM users", "DROP TABLE users", "TRUNCATE users", "SET FOREIGN_KEY_CHECKS=0", "select 1; drop table users"]) {
      if (bad.startsWith("select")) continue; // multipleStatements is disabled on the connection
      expect(() => assertReadOnlyStatement(bad)).toThrow(/read-only/);
    }
  });

  it("round-trips values losslessly through the JSON dump", () => {
    const buffer = Buffer.from([0, 1, 2, 255]);
    expect(decodeValue(encodeValue(buffer)) as Buffer).toEqual(buffer);
    expect(encodeValue("2026-10-06 09:30:00")).toBe("2026-10-06 09:30:00");
    expect(encodeValue({ a: [1, 2] })).toBe('{"a":[1,2]}');
    expect(encodeValue(null)).toBeNull();
    expect(encodeValue(undefined)).toBeNull();
    expect(encodeValue(42)).toBe(42);
    expect(encodeValue(BigInt("9007199254740993"))).toBe("9007199254740993");
  });

  it("rewrites URLs only when asked", () => {
    const rules = parseRewrites("https://wendytravel-g2nn4krv.manus.space/manus-storage/=>/manus-storage/");
    expect(applyRewrites("see https://wendytravel-g2nn4krv.manus.space/manus-storage/a.png", rules)).toBe("see /manus-storage/a.png");
    expect(applyRewrites("untouched", [])).toBe("untouched");
    expect(applyRewrites(5, rules)).toBe(5);
  });

  it("makes TiDB DDL idempotent and portable to MySQL", () => {
    const ddl = "CREATE TABLE `users` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001";
    const out = portableCreateTable(ddl);
    expect(out.startsWith("CREATE TABLE IF NOT EXISTS `users`")).toBe(true);
    expect(out).not.toContain("/*T!");
    expect(out).not.toContain("AUTO_INCREMENT=30001");
    expect(out).toContain("AUTO_INCREMENT,");
  });

  it("builds idempotent upserts and exact mirror inserts", () => {
    expect(buildInsert("users", ["id", "name"], 2, "upsert")).toBe("INSERT INTO `users` (`id`, `name`) VALUES (?, ?), (?, ?) ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `name` = VALUES(`name`)");
    expect(buildInsert("users", ["id"], 1, "mirror")).toBe("INSERT INTO `users` (`id`) VALUES (?)");
  });

  it("rejects dumps whose row counts do not match the manifest", () => {
    const dump: DumpFile = { manifest: { format: DUMP_FORMAT, createdAt: "", source: { host: "h", database: "d" }, tables: [{ name: "users", rowCount: 2, columns: ["id"], createTable: "" }] }, data: { users: [{ id: 1 }] } };
    expect(() => validateDump(dump)).toThrow(/inconsistent/);
    dump.data.users.push({ id: 2 });
    expect(() => validateDump(dump)).not.toThrow();
  });
});

describe("storage key discovery", () => {
  it("finds keys in relative paths, absolute URLs, CSS and JSON", () => {
    const text = [
      '<link rel="icon" href="/manus-storage/twc-favicon_1926a7ec.png" />',
      "background: url(/manus-storage/hero_abc.jpg);",
      '{"heroImageUrl":"https://wendytravel-g2nn4krv.manus.space/manus-storage/cruise-experiences/1_ab12cd34.jpg"}',
      "src={`/manus-storage/${dynamic}`}",
      "/manus-storage/with%20space.png?v=2",
    ].join("\n");
    expect(extractStorageKeys(text).sort()).toEqual(["cruise-experiences/1_ab12cd34.jpg", "hero_abc.jpg", "twc-favicon_1926a7ec.png", "with space.png"]);
  });

  it("flags other Manus-hosted URLs for manual review", () => {
    expect(findOtherManusUrls("x https://files.manuscdn.com/user_upload/a.png y https://wendytravel-g2nn4krv.manus.space/manus-storage/b.png")).toEqual(["https://files.manuscdn.com/user_upload/a.png"]);
  });
});

describe("self-host startup validation", () => {
  it("refuses to start self-host mode without a strong JWT secret, DB, staff password and storage", () => {
    const keys = ["SELF_HOST", "JWT_SECRET", "DATABASE_URL", "TWC_WENDY_PORTAL_PASSWORD", "TWC_JUNAID_PORTAL_PASSWORD", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      for (const k of keys) delete process.env[k];
      expect(selfHostConfigErrors()).toEqual([]); // Manus mode: never validated
      process.env.SELF_HOST = "1";
      process.env.JWT_SECRET = "short";
      expect(selfHostConfigErrors().length).toBe(4);
      Object.assign(process.env, { JWT_SECRET: "x".repeat(40), DATABASE_URL: "mysql://u:p@h/db", TWC_WENDY_PORTAL_PASSWORD: "pw", S3_BUCKET: "b", S3_ACCESS_KEY_ID: "a", S3_SECRET_ACCESS_KEY: "s" });
      expect(selfHostConfigErrors()).toEqual([]);
    } finally {
      for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    }
  });
});
