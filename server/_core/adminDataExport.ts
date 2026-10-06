import type { Express } from "express";
import { connectMysql, dumpDatabase } from "./dataTransfer";
import { ENV } from "./env";
import { sdk } from "./sdk";

/**
 * Fallback export path for when the hosting platform does not hand out the
 * database connection string: an admin-only, read-only JSON dump in the same
 * format scripts/import-db.ts consumes.
 *
 * Off unless ENABLE_ADMIN_DATA_EXPORT=1. Requires a signed-in admin session.
 */
export function registerAdminDataExport(app: Express) {
  app.get("/api/admin/data-export", async (req, res) => {
    if (process.env.ENABLE_ADMIN_DATA_EXPORT !== "1") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      user = null;
    }
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin session required" });
      return;
    }
    if (!ENV.databaseUrl) {
      res.status(503).json({ error: "Database not configured" });
      return;
    }
    const connection = await connectMysql(ENV.databaseUrl);
    try {
      const dump = await dumpDatabase(connection, ENV.databaseUrl);
      console.log(`[AdminExport] ${user.openId} exported ${dump.manifest.tables.length} tables`);
      res.set({ "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="twc-db-dump-${Date.now()}.json"` }).json(dump);
    } catch (error) {
      console.error("[AdminExport] failed", error);
      res.status(500).json({ error: "Export failed" });
    } finally {
      await connection.end().catch(() => {});
    }
  });
}
