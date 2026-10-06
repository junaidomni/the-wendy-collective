import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerHealthRoutes } from "./health";
import { registerAdminDataExport } from "./adminDataExport";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";

/** Builds the API app (everything except the Vite dev server / static SSR handler). */
export function createApp() {
  const app = express();
  if (ENV.selfHost) {
    // Railway (and most PaaS) terminate TLS at a proxy; trust it so req.ip,
    // req.protocol and Secure cookies reflect the real client connection.
    app.set("trust proxy", 1);
  }
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerHealthRoutes(app);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerAdminDataExport(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
