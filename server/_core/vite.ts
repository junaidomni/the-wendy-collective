import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import superjson from "superjson";
import type { HeadMeta } from "../../client/src/ssr/prefetch";

const CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN ?? "https://wendytravel-g2nn4krv.manus.space").replace(/\/$/, "");
const SITE_NAME = process.env.SITE_NAME ?? "The Wendy Collective";
const DEFAULT_OG_IMAGE = "/manus-storage/twc-social-preview_a42ef867.jpg";
const GRIMSLEY_SHARE_IMAGE_SOURCE = "/manus-storage/mardi-gras-approved_10fa6e55.png";
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");

function serveGrimsleyShareImage(app: Express) {
  app.get("/social/grimsley-mardi-gras.png", async (_req, res, next) => {
    try {
      const upstream = await fetch(`${CANONICAL_ORIGIN}${GRIMSLEY_SHARE_IMAGE_SOURCE}`, { redirect: "follow" });
      if (!upstream.ok) throw new Error(`Grimsley social image upstream returned ${upstream.status}`);
      const image = Buffer.from(await upstream.arrayBuffer());
      res.status(200).set({
        "Content-Type": "image/png",
        "Content-Length": String(image.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
      }).end(image);
    } catch (error) {
      next(error);
    }
  });
}

function buildHeadTags(head: HeadMeta) {
  const title = escapeHtml(head.title);
  const description = escapeHtml(head.description);
  const canonical = head.canonicalPath ? `${CANONICAL_ORIGIN}${head.canonicalPath}` : "";
  const ogUrl = head.ogUrlPath ? `${CANONICAL_ORIGIN}${head.ogUrlPath}` : canonical;
  const image = head.ogImage ? (head.ogImage.startsWith("http") ? head.ogImage : `${CANONICAL_ORIGIN}${head.ogImage}`) : `${CANONICAL_ORIGIN}${DEFAULT_OG_IMAGE}`;
  const imageType = image.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const robots = head.noindex || head.notFound ? "noindex, follow" : "index, follow";
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:type" content="${imageType}" />`,
    `<meta property="og:image:width" content="${head.ogImageWidth ?? 1200}" />`,
    `<meta property="og:image:height" content="${head.ogImageHeight ?? 630}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(head.ogImageAlt ?? "Cinematic travel for The Wendy Collective")}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    ogUrl ? `<meta property="og:url" content="${escapeHtml(ogUrl)}" />` : "",
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : "",
    `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "TravelAgency", name: SITE_NAME, url: CANONICAL_ORIGIN, description: head.description, image })}</script>`,
  ].filter(Boolean).join("\n");
}

function composeHtml(template: string, appHtml: string, head: HeadMeta, dehydratedState: unknown) {
  const state = JSON.stringify(superjson.serialize(dehydratedState)).replace(/</g, "\\u003c");
  return template.replace("</body>", () => `<script>window.__RQ_STATE__ = ${state}</script></body>`).replace("<!--app-head-->", () => buildHeadTags(head)).replace("<!--app-html-->", () => appHtml);
}

export async function setupVite(app: Express, server: Server) {
  serveGrimsleyShareImage(app);
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(url, template);
      template = template.replace("</head>", `<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>`);
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const { html, dehydratedState, head } = await render(url);
      res.status(head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, html, head, dehydratedState));
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  serveGrimsleyShareImage(app);

  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/.test(req.path)) return res.redirect(301, req.path.replace(/\/+$/, "") + req.originalUrl.slice(req.path.length));
    next();
  });
  app.use(express.static(distPath, { index: false, redirect: false }));
  const templatePath = path.resolve(distPath, "index.html");
  const serverEntryPath = path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");
  app.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const { render } = await import(serverEntryPath);
      const { html, dehydratedState, head } = await render(req.originalUrl);
      res.status(head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, html, head, dehydratedState));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const fallback: HeadMeta = { title: `${SITE_NAME} | Thoughtfully Planned Travel`, description: "The Wendy Collective creates thoughtfully planned journeys, elevated escapes, and effortless travel moments." };
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, "", fallback, {}));
    }
  });
}
