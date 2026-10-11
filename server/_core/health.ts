import type { Express } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { ENV } from "./env";

/**
 * Liveness/readiness probe for Railway (and any load balancer).
 * 200 when the process is up and, if DATABASE_URL is set, the DB answers.
 * 503 when the database is configured but unreachable. Never leaks config.
 */
export function registerHealthRoutes(app: Express) {
  app.get(["/healthz", "/api/health"], async (_req, res) => {
    let database: "ok" | "unconfigured" | "error" = "unconfigured";
    if (ENV.databaseUrl) {
      try {
        const db = await getDb();
        if (!db) throw new Error("no db");
        await db.execute(sql`select 1`);
        database = "ok";
      } catch {
        database = "error";
      }
    }
    res.set("Cache-Control", "no-store");
    res.status(database === "error" ? 503 : 200).json({ ok: database !== "error", mode: ENV.selfHost ? "self-host" : "manus", database });
  });
}
