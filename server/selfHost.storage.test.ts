// Self-host storage: S3-compatible backend behind the same storage helpers and
// the same /manus-storage/{key} public path as Manus.
import type { AddressInfo } from "node:net";
import express from "express";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __setS3TestDoubles } from "./_core/s3Storage";
import { registerStorageProxy } from "./_core/storageProxy";
import { storageGet, storageGetSignedUrl, storagePut } from "./storage";

const VARS = ["SELF_HOST", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_BASE_URL", "BUILT_IN_FORGE_API_URL", "BUILT_IN_FORGE_API_KEY"];
let saved: Record<string, string | undefined> = {};
const sent: unknown[] = [];
const fakeClient = { send: vi.fn(async (command: unknown) => { sent.push(command); return {}; }) };
const fakePresigner = vi.fn(async (_client: unknown, command: { input: { Bucket: string; Key: string } }) => `https://signed.example/${command.input.Bucket}/${command.input.Key}?sig=1`);

function setEnv(values: Record<string, string | undefined>) {
  for (const key of VARS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) if (value !== undefined) process.env[key] = value;
}

beforeEach(() => {
  saved = Object.fromEntries(VARS.map((key) => [key, process.env[key]]));
  sent.length = 0;
  fakeClient.send.mockClear();
  setEnv({ SELF_HOST: "1", S3_ENDPOINT: "https://acct.r2.cloudflarestorage.com", S3_BUCKET: "twc-files", S3_ACCESS_KEY_ID: "AKIATEST", S3_SECRET_ACCESS_KEY: "secret" });
  __setS3TestDoubles({ client: fakeClient as never, presigner: fakePresigner as never });
});

afterEach(() => {
  __setS3TestDoubles();
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
});

async function proxyRequest(path: string) {
  const app = express();
  registerStorageProxy(app);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}${path}`, { redirect: "manual" });
    return { status: response.status, location: response.headers.get("location"), cache: response.headers.get("cache-control") };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe("self-host storage helpers", () => {
  it("uploads to the S3 bucket and returns the same /manus-storage URL shape as Manus", async () => {
    const forgeFetch = vi.fn();
    vi.stubGlobal("fetch", forgeFetch);
    const result = await storagePut("/cruise-experiences/123.jpg", Buffer.from("img"), "image/jpeg");
    expect(result.key).toMatch(/^cruise-experiences\/123_[0-9a-f]{8}\.jpg$/);
    expect(result.url).toBe(`/manus-storage/${result.key}`);
    expect(forgeFetch).not.toHaveBeenCalled();
    const put = sent[0] as PutObjectCommand;
    expect(put).toBeInstanceOf(PutObjectCommand);
    expect(put.input).toMatchObject({ Bucket: "twc-files", Key: result.key, ContentType: "image/jpeg" });
  });

  it("keeps storageGet as a pure path helper and presigns signed URLs from S3", async () => {
    expect(await storageGet("/a/b.png")).toEqual({ key: "a/b.png", url: "/manus-storage/a/b.png" });
    expect(await storageGetSignedUrl("a/b.png")).toBe("https://signed.example/twc-files/a/b.png?sig=1");
  });

  it("fails with a clear message when S3 is not configured", async () => {
    setEnv({ SELF_HOST: "1" });
    await expect(storagePut("x.txt", "hello")).rejects.toThrow(/S3_BUCKET/);
  });
});

describe("self-host storage proxy", () => {
  it("redirects /manus-storage/{key} to the public bucket URL when S3_PUBLIC_BASE_URL is set", async () => {
    process.env.S3_PUBLIC_BASE_URL = "https://files.thewendycollective.com/";
    const result = await proxyRequest("/manus-storage/twc-favicon_1926a7ec.png");
    expect(result.status).toBe(307);
    expect(result.location).toBe("https://files.thewendycollective.com/twc-favicon_1926a7ec.png");
    expect(result.cache).toBe("public, max-age=3600");
  });

  it("redirects to a short-lived presigned URL when the bucket is private", async () => {
    const result = await proxyRequest("/manus-storage/cruise-experiences/1_abcd1234.jpg");
    expect(result.status).toBe(307);
    expect(result.location).toBe("https://signed.example/twc-files/cruise-experiences/1_abcd1234.jpg?sig=1");
    expect(result.cache).toBe("no-store");
  });
});

describe("Manus mode is unchanged", () => {
  it("still uploads through the Forge presign API when SELF_HOST is not set", async () => {
    setEnv({ BUILT_IN_FORGE_API_URL: "https://forge.example", BUILT_IN_FORGE_API_KEY: "k" });
    const forgeFetch = vi.fn(async (url: URL | string) => String(url).includes("presign/put")
      ? new Response(JSON.stringify({ url: "https://s3.example/put" }), { status: 200 })
      : new Response("", { status: 200 }));
    vi.stubGlobal("fetch", forgeFetch);
    const result = await storagePut("file.txt", "hello", "text/plain");
    expect(result.url).toBe(`/manus-storage/${result.key}`);
    expect(String(forgeFetch.mock.calls[0][0])).toContain("https://forge.example/v1/storage/presign/put");
    expect(fakeClient.send).not.toHaveBeenCalled();
  });

  it("does not treat HeadObject 404s as errors when checking for copied files", async () => {
    const { s3ObjectExists } = await import("./_core/s3Storage");
    fakeClient.send.mockImplementationOnce(async (command: unknown) => {
      expect(command).toBeInstanceOf(HeadObjectCommand);
      throw Object.assign(new Error("NotFound"), { name: "NotFound", $metadata: { httpStatusCode: 404 } });
    });
    expect(await s3ObjectExists("missing.png")).toBe(false);
    expect(await s3ObjectExists("present.png")).toBe(true);
  });
});
