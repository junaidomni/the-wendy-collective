import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(fileURLToPath(new URL("./Home.tsx", import.meta.url)), "utf8");

describe("homepage hero film", () => {
  it("uses the seven-scene full-frame hero asset", () => {
    expect(homeSource).toContain('/manus-storage/twc-hero-loop-nine-scenes-forward-only_03e8ceac.mp4');
    expect(homeSource).toContain('/manus-storage/twc-hero-poster-nine-scenes-beach-opening_aaddc342.jpg');
    expect(homeSource).toContain('className="hero-video"');
    expect(homeSource).not.toContain('twc-hero-loop-nine-scenes-final-clean_d318c9b4.mp4');
  });
});
