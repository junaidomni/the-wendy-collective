// Values are read lazily (getters) so tests and scripts can switch modes by
// changing process.env without re-importing modules.
//
// Two runtime modes share this codebase:
//   - Manus (default): Manus OAuth, Forge storage/notification APIs.
//   - Self-host (SELF_HOST=1): staff portal passwords + JWT session cookies,
//     S3-compatible storage, Resend for owner notifications. No Manus calls.
const SELF_HOST_APP_ID = "twc-self-host";

const env = (name: string) => process.env[name]?.trim() ?? "";

export const ENV = {
  get selfHost() {
    return ["1", "true", "yes"].includes(env("SELF_HOST").toLowerCase());
  },
  // Session tokens embed appId and verifySession requires it to be non-empty.
  // Self-host has no Manus app id, so it uses a fixed marker instead.
  get appId() {
    return env("VITE_APP_ID") || (ENV.selfHost ? SELF_HOST_APP_ID : "");
  },
  get cookieSecret() {
    return process.env.JWT_SECRET ?? "";
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return process.env.OAUTH_SERVER_URL ?? "";
  },
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forgeApiUrl() {
    return process.env.BUILT_IN_FORGE_API_URL ?? "";
  },
  get forgeApiKey() {
    return process.env.BUILT_IN_FORGE_API_KEY ?? "";
  },
  // S3-compatible storage (Cloudflare R2, Railway bucket, AWS S3, MinIO...).
  get s3() {
    return {
      endpoint: env("S3_ENDPOINT"),
      region: env("S3_REGION") || "auto",
      bucket: env("S3_BUCKET"),
      accessKeyId: env("S3_ACCESS_KEY_ID"),
      secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
      publicBaseUrl: env("S3_PUBLIC_BASE_URL").replace(/\/+$/, ""),
      forcePathStyle: env("S3_FORCE_PATH_STYLE") !== "0",
    };
  },
  get s3Configured() {
    const s3 = ENV.s3;
    return Boolean(s3.bucket && s3.accessKeyId && s3.secretAccessKey);
  },
  // Self-host replacement for Manus owner notifications (sent through Resend).
  get ownerNotifyEmail() {
    return env("OWNER_NOTIFY_EMAIL");
  },
};

/**
 * Returns fatal configuration problems for self-host mode. Empty array = OK.
 * Manus mode is never validated here so its behaviour is unchanged.
 */
export function selfHostConfigErrors(): string[] {
  if (!ENV.selfHost) return [];
  const errors: string[] = [];
  if (ENV.cookieSecret.length < 32) errors.push("JWT_SECRET must be set to a random string of at least 32 characters");
  if (!ENV.databaseUrl) errors.push("DATABASE_URL is required");
  if (!env("TWC_WENDY_PORTAL_PASSWORD") && !env("TWC_JUNAID_PORTAL_PASSWORD")) {
    errors.push("Set TWC_WENDY_PORTAL_PASSWORD and/or TWC_JUNAID_PORTAL_PASSWORD, otherwise nobody can sign in");
  }
  if (!ENV.s3Configured) errors.push("S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required for file storage");
  return errors;
}

/** Non-fatal self-host notices, logged once at startup. */
export function selfHostConfigWarnings(): string[] {
  if (!ENV.selfHost) return [];
  const warnings: string[] = [];
  if (!env("CANONICAL_ORIGIN")) warnings.push("CANONICAL_ORIGIN is not set; SEO/OG tags will point at the old manus.space origin");
  if (!ENV.s3.publicBaseUrl) warnings.push("S3_PUBLIC_BASE_URL is not set; /manus-storage/* will redirect to short-lived presigned URLs (works, but not CDN-cacheable)");
  if (!ENV.ownerNotifyEmail) warnings.push("OWNER_NOTIFY_EMAIL is not set; owner notifications (Manus push) are disabled. Resend email alerts still work if RESEND_* is set");
  if (ENV.forgeApiUrl || ENV.forgeApiKey) warnings.push("BUILT_IN_FORGE_API_* is set but ignored in self-host mode");
  return warnings;
}
