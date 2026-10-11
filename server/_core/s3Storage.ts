// S3-compatible storage backend used in self-host mode (SELF_HOST=1).
// Works with Cloudflare R2, Railway buckets, AWS S3 and MinIO.
//
// Object keys are identical to the keys used on Manus, and the app keeps
// serving files at the stable path /manus-storage/{key}. That path is what is
// stored in the database and hard-coded in the client, so migrating files only
// requires copying objects with the same keys; no URL rewriting is needed.
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./env";

export const PRESIGNED_GET_TTL_SECONDS = 15 * 60;

type S3Like = Pick<S3Client, "send">;

let client: S3Like | null = null;
let clientSignature = "";
let presigner: typeof getSignedUrl = getSignedUrl;

function config() {
  const s3 = ENV.s3;
  if (!ENV.s3Configured) {
    throw new Error("Storage config missing: set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY (and S3_ENDPOINT for R2/Railway/MinIO)");
  }
  return s3;
}

export function getS3Client(): S3Like {
  const s3 = config();
  const signature = [s3.endpoint, s3.region, s3.accessKeyId, s3.forcePathStyle].join("|");
  if (!client || signature !== clientSignature) {
    client = new S3Client({
      region: s3.region,
      endpoint: s3.endpoint || undefined,
      forcePathStyle: s3.endpoint ? s3.forcePathStyle : false,
      credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },
    });
    clientSignature = signature;
  }
  return client;
}

/** Test hook: inject a fake client / presigner. */
export function __setS3TestDoubles(fake: { client?: S3Like | null; presigner?: typeof getSignedUrl } = {}) {
  client = fake.client ?? null;
  clientSignature = fake.client ? [ENV.s3.endpoint, ENV.s3.region, ENV.s3.accessKeyId, ENV.s3.forcePathStyle].join("|") : "";
  presigner = fake.presigner ?? getSignedUrl;
}

export async function s3PutObject(key: string, data: Buffer | Uint8Array | string, contentType: string) {
  const s3 = config();
  const body = typeof data === "string" ? Buffer.from(data) : data;
  await getS3Client().send(new PutObjectCommand({ Bucket: s3.bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function s3ObjectExists(key: string): Promise<boolean> {
  const s3 = config();
  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: s3.bucket, Key: key }));
    return true;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    const name = (error as { name?: string }).name;
    if (status === 404 || name === "NotFound" || name === "NoSuchKey") return false;
    throw error;
  }
}

export async function s3PresignedGetUrl(key: string): Promise<string> {
  const s3 = config();
  return presigner(getS3Client() as S3Client, new GetObjectCommand({ Bucket: s3.bucket, Key: key }), { expiresIn: PRESIGNED_GET_TTL_SECONDS });
}

/**
 * Where /manus-storage/{key} should redirect to. Public bucket/CDN URL when
 * S3_PUBLIC_BASE_URL is configured (cacheable), otherwise a presigned GET URL.
 */
export async function s3ResolveDownloadUrl(key: string): Promise<{ url: string; cacheable: boolean }> {
  const base = ENV.s3.publicBaseUrl;
  if (base) return { url: `${base}/${key.split("/").map(encodeURIComponent).join("/")}`, cacheable: true };
  return { url: await s3PresignedGetUrl(key), cacheable: false };
}
