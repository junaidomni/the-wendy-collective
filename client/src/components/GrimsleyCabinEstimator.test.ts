import { describe, expect, it } from "vitest";
import { calculateGrimsleyDepositCents, calculateGrimsleyEstimate } from "./GrimsleyCabinEstimator";

describe("Grimsley cabin estimator", () => {
  it("uses the approved two-traveler balcony category and separates optional extras", () => {
    const estimate = calculateGrimsleyEstimate({ occupancy: 2, roomType: "balcony", categoryId: "standard-balcony-lido-2", protection: false, wifiPlanId: "value", wifiUsers: 2, cheersAdults: 1 });
    expect(estimate.selectedCategory?.title).toBe("Standard Balcony, Lido Deck");
    expect(estimate.fareCents).toBe(155200);
    expect(estimate.gratuitiesCents).toBe(13600);
    expect(estimate.cabinTotalCents).toBe(168800);
    expect(estimate.extrasTotalCents).toBe(52616);
    expect(estimate.tripTotalCents).toBe(221416);
  });

  it("adds optional protection without changing the verified cabin fare", () => {
    const estimate = calculateGrimsleyEstimate({ occupancy: 2, roomType: "interior", categoryId: "interior-atlantic-2", protection: true, wifiPlanId: "none", wifiUsers: 1, cheersAdults: 0 });
    expect(estimate.fareCents).toBe(137800);
    expect(estimate.protectionCents).toBe(19000);
    expect(estimate.cabinTotalCents).toBe(170400);
    expect(estimate.tripTotalCents).toBe(170400);
  });

  it("adds the selected JiJi adult and child dining reference to extras and the vacation total", () => {
    const estimate = calculateGrimsleyEstimate({ occupancy: 2, roomType: "interior", categoryId: "interior-atlantic-2", protection: false, wifiPlanId: "none", wifiUsers: 1, cheersAdults: 0, diningExperience: "JiJi Asian Kitchen", diningAdults: 1, diningChildren: 1 });
    expect(estimate.diningCents).toBe(3500);
    expect(estimate.extrasTotalCents).toBe(3500);
    expect(estimate.tripTotalCents).toBe(154900);
  });

  it("maps the clarified $642 four-traveler rate to a Cove Balcony and limits two-traveler Ocean View to Cloud 9 Spa", () => {
    const cove = calculateGrimsleyEstimate({ occupancy: 4, roomType: "balcony", categoryId: "cove-balcony-4", protection: false, wifiPlanId: "none", wifiUsers: 1, cheersAdults: 0 });
    const oceanView = calculateGrimsleyEstimate({ occupancy: 2, roomType: "ocean_view", categoryId: "ocean-view-atlantic-2", protection: false, wifiPlanId: "none", wifiUsers: 1, cheersAdults: 0 });
    expect(cove.selectedCategory?.title).toBe("Cove Balcony");
    expect(cove.fareCents).toBe(256800);
    expect(oceanView.selectedCategory?.title).toBe("Cloud 9 Spa Ocean View");
    expect(oceanView.fareCents).toBe(199000);
  });

  it("uses a $75 per-traveler deposit unless the returning Carnival guest exception applies", () => {
    expect(calculateGrimsleyDepositCents(2)).toBe(15000);
    expect(calculateGrimsleyDepositCents(2, true)).toBe(10000);
    expect(calculateGrimsleyDepositCents(4)).toBe(30000);
  });
});
