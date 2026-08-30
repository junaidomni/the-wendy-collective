import { describe, expect, it } from "vitest";
import { calculateGrimsleyEstimate } from "./GrimsleyCabinEstimator";

describe("Grimsley cabin estimator", () => {
  it("uses the approved two-traveler balcony category and separates optional extras", () => {
    const estimate = calculateGrimsleyEstimate({ occupancy: 2, roomType: "balcony", categoryId: "cabin-14", protection: false, wifiPlanId: "value", wifiUsers: 2, cheersAdults: 1 });
    expect(estimate.selectedCategory?.title).toBe("Standard Balcony, Deck 9 location");
    expect(estimate.fareCents).toBe(185800);
    expect(estimate.gratuitiesCents).toBe(13600);
    expect(estimate.cabinTotalCents).toBe(199400);
    expect(estimate.extrasTotalCents).toBe(52616);
    expect(estimate.tripTotalCents).toBe(252016);
  });

  it("adds optional protection without changing the verified cabin fare", () => {
    const estimate = calculateGrimsleyEstimate({ occupancy: 2, roomType: "interior", categoryId: "cabin-0", protection: true, wifiPlanId: "none", wifiUsers: 1, cheersAdults: 0 });
    expect(estimate.fareCents).toBe(137800);
    expect(estimate.protectionCents).toBe(19000);
    expect(estimate.cabinTotalCents).toBe(170400);
    expect(estimate.tripTotalCents).toBe(170400);
  });
});
