import { describe, expect, it } from "vitest";
import {
  calculateGrimsleyDepositCents,
  calculateGrimsleyEstimate,
} from "./GrimsleyCabinEstimator";

describe("Grimsley cabin preference planner", () => {
  it("keeps cabin pricing out of the calculator while preserving optional planning calculations", () => {
    const estimate = calculateGrimsleyEstimate({
      occupancy: 2,
      wifiPlanId: "value",
      wifiUsers: 2,
      cheersAdults: 1,
    });

    expect(estimate.extrasTotalCents).toBe(52616);
    expect(estimate).not.toHaveProperty("fareCents");
    expect(estimate).not.toHaveProperty("cabinTotalCents");
    expect(estimate).not.toHaveProperty("tripTotalCents");
  });

  it("adds the selected JiJi adult and child dining reference to optional planning costs", () => {
    const estimate = calculateGrimsleyEstimate({
      occupancy: 2,
      wifiPlanId: "none",
      wifiUsers: 1,
      cheersAdults: 0,
      diningExperience: "JiJi Asian Kitchen",
      diningAdults: 1,
      diningChildren: 1,
    });

    expect(estimate.diningCents).toBe(3500);
    expect(estimate.extrasTotalCents).toBe(3500);
  });

  it("uses a $75 per traveler deposit unless the returning Carnival guest exception applies", () => {
    expect(calculateGrimsleyDepositCents(2)).toBe(15000);
    expect(calculateGrimsleyDepositCents(2, true)).toBe(10000);
    expect(calculateGrimsleyDepositCents(4)).toBe(30000);
  });
});
