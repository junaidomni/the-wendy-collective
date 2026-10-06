# Self-hosting The Wendy Collective (off Manus, on Railway)

The same codebase runs in two modes:

- **Manus mode (default)**: what runs today. Manus OAuth, Manus "Forge" storage and notifications, Manus Vite plugins. Nothing changes unless `SELF_HOST=1` is set.
- **Self-host mode (`SELF_HOST=1`)**: no Manus calls at all. Staff sign in with portal passwords, sessions are signed cookies, files live in S3-compatible storage, owner notifications go out by email through Resend.

> Manus syncs the GitHub **main** branch both ways. Keep this work on the `self-host` branch until cutover so Manus never pulls it. Merging is safe later because every change defaults to Manus behaviour, but there's no reason to merge before cutover.

## What was Manus-specific, and what replaces it

| Manus dependency | Where | Self-host replacement |
|---|---|---|
| Manus OAuth login (`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, `OWNER_OPEN_ID`) | `server/_core/oauth.ts`, `server/_core/sdk.ts`, `client/src/const.ts` | The existing staff portal login at `/wendy/login` (`TWC_WENDY_PORTAL_PASSWORD`, `TWC_JUNAID_PORTAL_PASSWORD`) with HS256 session cookies signed by `JWT_SECRET` (12 h). `/api/oauth/callback` returns 404. The client sends sign-in to `/wendy/login` when no OAuth portal is configured. Only `twc_staff_*` sessions whose password is still configured are accepted. Manus-issued tokens, non-staff users and Manus cron sessions are rejected. |
| Forge storage (`BUILT_IN_FORGE_API_URL/KEY`) | `server/storage.ts`, `server/_core/storageProxy.ts` | S3-compatible storage (`S3_*`) in `server/_core/s3Storage.ts`. Same helper API (`storagePut`, `storageGet`, `storageGetSignedUrl`) and the same public path `/manus-storage/{key}`, which now redirects to `S3_PUBLIC_BASE_URL/{key}` or to a 15-minute presigned URL. Stored URLs in the DB and hard-coded image paths keep working with no rewrite. |
| Forge owner notifications | `server/_core/notification.ts` | Resend email to `OWNER_NOTIFY_EMAIL`. If that isn't set, notifications are skipped with one log line. Callers already treat that as "push unavailable", and the separate Resend trip-brief / cabin-request emails and in-portal alerts still work. |
| Forge LLM, image generation, voice transcription, maps, data API, heartbeat/cron | `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`, `map.ts`, `dataApi.ts`, `heartbeat.ts`; `client/src/components/Map.tsx`, `AIChatBox.tsx` | **Not used by the site** (template leftovers, never imported by routes or pages). Left untouched. If called in self-host mode they fail with their existing "not configured" errors. |
| Manus Vite plugins (`vite-plugin-manus-runtime`, debug collector, jsx-loc) | `vite.config.ts` | Left out of `SELF_HOST=1` builds. |
| Manus Umami analytics (`VITE_ANALYTICS_*`) | `client/index.html` | The script tag is removed when `VITE_ANALYTICS_ENDPOINT` isn't set at build time. Set both vars at build time to use your own Umami. |
| Port hopping, no healthcheck | `server/_core/index.ts` | In self-host production it binds exactly `$PORT`, exposes `GET /healthz` (also `/api/health`), shuts down cleanly on SIGTERM, trusts one proxy hop, and refuses to start if required config is missing. |
| Manus default origin | `server/_core/vite.ts` | Set `CANONICAL_ORIGIN=https://thewendycollective.com`. |

## Environment variables (self-host)

Required (the server refuses to start without them):

| Var | Notes |
|---|---|
| `SELF_HOST` | `1`. The Dockerfile already sets it. |
| `DATABASE_URL` | New MySQL 8 database. On Railway: `${{MySQL.MYSQL_URL}}`. |
| `JWT_SECRET` | At least 32 random characters (`openssl rand -base64 48`). Must be **new**. Don't reuse the Manus one. |
| `TWC_WENDY_PORTAL_PASSWORD` / `TWC_JUNAID_PORTAL_PASSWORD` | At least one. Same values as on Manus, or new ones. |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Bucket credentials (R2 API token, Railway bucket, or AWS IAM key). |

Strongly recommended:

| Var | Notes |
|---|---|
| `S3_ENDPOINT` | Required for R2 (`https://<accountid>.r2.cloudflarestorage.com`), Railway buckets and MinIO. Leave empty for AWS. |
| `S3_REGION` | Default `auto` (R2). For AWS use e.g. `us-east-1`. |
| `S3_PUBLIC_BASE_URL` | Public/CDN URL of the bucket (e.g. an R2 custom domain `https://files.thewendycollective.com`). Without it, files are served through presigned redirects, which works but isn't CDN-cacheable. |
| `S3_FORCE_PATH_STYLE` | Default on when `S3_ENDPOINT` is set. Set `0` for virtual-hosted style. |
| `CANONICAL_ORIGIN` | `https://thewendycollective.com` (canonical/OG tags, Grimsley share image). |
| `SITE_NAME` | `The Wendy Collective` |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_ALERT_RECIPIENT` | Same as Manus. Enables the trip-brief / cabin-request emails. |
| `OWNER_NOTIFY_EMAIL` | Address that receives what Manus used to push as owner notifications. |

Optional: `PORT` (Railway injects it), `DB_SSL=1` (force TLS to MySQL), `ENABLE_ADMIN_DATA_EXPORT=1` (see "If Manus won't give you the DB"), `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` (build-time).

Ignored in self-host mode: `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL/KEY`, `VITE_FRONTEND_FORGE_API_*`.

Migration scripts only: `SOURCE_DATABASE_URL`, `TARGET_DATABASE_URL`, `REWRITE_URLS`, `SOURCE_STORAGE_ORIGIN`, `ALLOW_TIDB_TARGET`.

## Railway setup

1. New project, then "Deploy from GitHub repo" `junaidomni/the-wendy-collective`, branch **`self-host`**. Railway picks up `railway.json` and builds the `Dockerfile`. The start command is `node dist/index.js` and the healthcheck is `/healthz`.
2. Add a **MySQL** service. On the app service set `DATABASE_URL=${{MySQL.MYSQL_URL}}`.
3. Storage: create a Cloudflare R2 bucket (recommended: free egress plus a custom domain for `S3_PUBLIC_BASE_URL`) or a Railway bucket, and set the `S3_*` vars.
4. Set the rest of the env vars above, then deploy. `/healthz` must return `{"ok":true,"mode":"self-host","database":"ok"}`.
5. Generate a Railway domain (`*.up.railway.app`) for testing before DNS.

Local run in self-host mode: `SELF_HOST=1 pnpm build && SELF_HOST=1 NODE_ENV=production <env vars> pnpm start`.

## What Junaid must provide

1. **The Manus database connection string** (TiDB Cloud MySQL, usually `mysql://...@gateway...tidbcloud.com:4000/<db>`). Manus doesn't document a public export, so try these in order:
   - In the Manus project, open the Management UI **Database** panel and its settings to see whether connection details are shown (enable SSL if offered).
   - Or ask the Manus agent in the project chat: "print the DATABASE_URL environment variable of this project" (it runs in a sandbox that has it), or have it run `mysqldump`.
   - Otherwise use the fallback below.
2. **Storage**: nothing needed. The live site serves every file publicly at `/manus-storage/{key}`. The copy script downloads through that route, read-only. Only if Manus also offers a storage bucket export is that an alternative.
3. **New accounts/credentials**: Railway project with MySQL; R2 (or other S3) bucket plus API token; optional `files.` subdomain for the bucket.
4. **Secrets to carry over**: the two portal passwords, Resend API key and from address (from Manus Settings, then Secrets).
5. **DNS access** for `thewendycollective.com` (currently behind Cloudflare). Also check where the domain is registered and whether Manus manages it.

### If Manus won't give you the DB

The branch includes `GET /api/admin/data-export`: an admin-only, read-only JSON dump in the same format the import script reads. It's off unless `ENABLE_ADMIN_DATA_EXPORT=1`. Using it on Manus means getting this code deployed there (merge to main, Manus redeploys) and setting that secret in Manus. That's a change to the live site, so only do it if the connection string really can't be obtained. Then, signed in at `/wendy/login` on the live site, open `/api/admin/data-export` to download the file, and turn the flag off again. Manus's Database panel grid can also be used to eyeball/export tables as a last resort.

## Data migration tooling

All scripts run from a laptop (or `railway run`) with `pnpm tsx`. None of them ever writes to Manus.

| Script | What it does | Safety |
|---|---|---|
| `scripts/export-manus-db.ts [out.json]` | Dumps every table's DDL and rows from `SOURCE_DATABASE_URL` into one JSON file under `exports/` (git-ignored, mode 600). | Only `SELECT`/`SHOW` statements, enforced in code. Runs in one consistent-snapshot transaction that is rolled back. Never reads `DATABASE_URL`. |
| `scripts/import-db.ts dump.json [--mirror] [--dry-run]` | Creates missing tables (`CREATE TABLE IF NOT EXISTS`, TiDB-only syntax stripped), then upserts all rows into `TARGET_DATABASE_URL` and checks every table's row count against the dump. `--mirror` empties each table first so it's an exact copy. | Idempotent. Refuses the source DB, the dump's own DB, and any TiDB Cloud host unless `ALLOW_TIDB_TARGET=1`. Exits 1 on any count mismatch. |
| `scripts/copy-storage-to-s3.ts --dump dump.json [--keys file] [--dry-run]` | Finds every `/manus-storage/{key}` referenced in the dump and the source code (20 site images/videos today, plus uploaded experience images), downloads each from the live site and uploads it to S3 with the **same key**. Checks every key with HEAD afterwards. Lists any other Manus-hosted URLs for manual review. | Plain public GETs on Manus. Skips keys already in the bucket. Exits 1 if anything is missing. |

The dump includes `__drizzle_migrations`, so drizzle's migration state carries over. **Don't** run `pnpm db:push` against the new DB before importing.

Alternative to the export script: `mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF --ssl-mode=REQUIRED -h <host> -P 4000 -u <user> -p <db> > manus.sql`, then `mysql <new db> < manus.sql`. Row counts then have to be checked by hand.

## Cutover runbook

Rehearse steps 1 to 5 at least once against the Railway URL before the real cutover. Manus stays live throughout.

1. **Prep** (any time before): Railway app plus MySQL plus bucket deployed from `self-host`, with all env vars set. `/healthz` is OK on the Railway domain. Lower the DNS TTL for `thewendycollective.com` to 300 s a day ahead.
2. **Export** (read-only on Manus):
   `SOURCE_DATABASE_URL='<manus url>' pnpm tsx scripts/export-manus-db.ts exports/cutover.json`
3. **Import**:
   `TARGET_DATABASE_URL='<railway url>' SOURCE_DATABASE_URL='<manus url>' REWRITE_URLS='https://wendytravel-g2nn4krv.manus.space/manus-storage/=>/manus-storage/' pnpm tsx scripts/import-db.ts exports/cutover.json --mirror`
4. **Files**:
   `S3_...=... pnpm tsx scripts/copy-storage-to-s3.ts --dump exports/cutover.json`
5. **Verify**:
   - The import printed `Verified: all N tables match`. The copy printed `Verified in bucket: X/X`.
   - Smoke test on the Railway URL: home page and images load; destination pages; a Grimsley private link and a traveler-profile link open with their tokens; `/wendy` shows the login card when signed out; sign in at `/wendy/login` as Wendy and as Junaid; CRM dashboard shows the expected deals and inquiries; upload an experience image; submit a test inquiry and check that the email arrives (then delete the test record); `/api/trpc/crm.dashboard` signed out returns 403.
6. **Freeze and final sync**: tell Wendy not to make changes for about 15 minutes. Re-run steps 2 to 4 (`--mirror` makes it an exact copy; the file copy skips what's already there). Re-verify the counts.
7. **DNS switch**: in Cloudflare, add the custom domain in Railway and point `thewendycollective.com` (and `www`) at the Railway target Railway shows (CNAME, flattened at the apex). Remove the Manus custom-domain binding only after Railway serves the domain with a valid certificate.
8. **Post-cutover**: check `https://thewendycollective.com/healthz`, run the smoke test again, check that a real inquiry reaches Wendy. Keep Manus untouched (don't delete the project or data) for at least 2 weeks.

**Rollback**: point DNS back to the Manus target (and re-bind the custom domain in Manus if it was removed). Manus still has the pre-freeze data. Any inquiries or edits made on Railway after cutover must be copied back by hand: export them from the Railway DB with `export-manus-db.ts` using `SOURCE_DATABASE_URL=<railway url>` and review.

## Risks / known gaps

- **Manus DB access isn't guaranteed.** If neither the connection string nor the admin export is available, the data has to be re-keyed or copied out of the Database panel.
- **TiDB to MySQL DDL drift**: handled for clustered-index comments and AUTO_INCREMENT. Any other TiDB-only DDL fails loudly at import (the fix is a quick edit to the DDL in the dump).
- **Sessions don't carry over**: staff sign in again after cutover (new `JWT_SECRET`). Private client links are DB tokens, so they keep working.
- **Uploads made on Manus after the final export** are missed. Avoid them with the freeze in step 6.
- **Manus-hosted absolute URLs** other than `/manus-storage` (e.g. `files.manuscdn.com`) aren't copied. The copy script lists any it finds in the DB.
- **Single instance**: the staff-login rate limiter is in memory. Fine for one Railway replica. Multiple replicas would need a shared store.
- **Cost/ops**: backups are now ours. Enable Railway MySQL backups (or a scheduled `export-manus-db.ts` run against Railway).
