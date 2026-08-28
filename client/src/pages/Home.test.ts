import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(fileURLToPath(new URL("./Home.tsx", import.meta.url)), "utf8");

describe("homepage hero film", () => {
  it("uses the seven-scene full-frame hero asset", () => {
    expect(homeSource).toContain('/manus-storage/twc-hero-loop-seven-scenes_b751cd60.mp4');
    expect(homeSource).toContain('className="hero-video"');
    expect(homeSource).not.toContain('twc-hero-loop-real-world-no-sailboats_8a6909b9.mp4');
  });
});
