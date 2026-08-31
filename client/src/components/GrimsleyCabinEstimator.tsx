import { useEffect, useMemo, useState } from "react";

type RoomType = "interior" | "ocean_view" | "balcony" | "suite";

type CabinCategory = {
  id: string;
  occupancy: 2 | 3 | 4;
  roomType: RoomType;
  title: string;
  fare: number;
  detail: string;
};

export type GrimsleyPlanningSnapshot = {
  occupancy: number;
  roomType: RoomType;
  selectedCabinCategory: string;
  estimatedFareCents: number;
  estimatedGratuitiesCents: number;
  estimatedProtectionCents: number;
  extras: {
    wifiPlan: string;
    wifiUsers: number;
    cheersAdults: number;
    diningExperience: string;
    diningAdults: number;
    diningChildren: number;
    diningTotalCents: number;
    rateQualifiers?: ("military" | "interline" | "senior_55_plus")[];
  };
  estimate: {
    cabinTotalCents: number;
    extrasTotalCents: number;
    tripTotalCents: number;
    depositCents: number;
    onboardCreditCents: number;
  };
};

const cabinCategories: CabinCategory[] = [
  { id: "interior-atlantic-2", occupancy: 2, roomType: "interior", title: "Atlantic Deck", fare: 689, detail: "Deck 4. Your cabin will be assigned forward or aft. Wendy confirms the final deck, placement, taxes, and live availability before booking." },
  { id: "interior-promenade-2", occupancy: 2, roomType: "interior", title: "Promenade Deck", fare: 692, detail: "Deck 5. Wendy confirms the final deck, placement, taxes, and live availability before booking." },
  { id: "interior-lido-2", occupancy: 2, roomType: "interior", title: "Lido Deck", fare: 694, detail: "Deck 15, forward, near the main Lido pool and buffet area. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-deck-10-2", occupancy: 2, roomType: "interior", title: "Deck 10", fare: 699, detail: "Deck 10. Your cabin will be assigned forward or aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-deck-11-2", occupancy: 2, roomType: "interior", title: "Deck 11", fare: 704, detail: "Deck 11. Your cabin will be assigned forward or aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-decks-11-12-2", occupancy: 2, roomType: "interior", title: "Decks 11 and 12", fare: 709, detail: "Deck 11, mid ship, or Deck 12, aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-decks-12-14-2", occupancy: 2, roomType: "interior", title: "Decks 12 and 14", fare: 714, detail: "Deck 12, mid ship, or Deck 14, aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-decks-14-15-2", occupancy: 2, roomType: "interior", title: "Decks 14 and 15", fare: 719, detail: "Deck 14, mid ship, or Deck 15, forward. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-decks-15-16-2", occupancy: 2, roomType: "interior", title: "Decks 15 and 16", fare: 734, detail: "Deck 15, mid ship, or Deck 16, forward. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "cloud-9-ocean-view-2", occupancy: 2, roomType: "ocean_view", title: "Cloud 9 Spa Ocean View", fare: 995, detail: "Deck 5, mid ship. This approximately 243 square foot stateroom has natural light and an obstructed view from a window beside an exterior walkway. Eligible spa benefits are for the first two guests. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "cove-balcony-2", occupancy: 2, roomType: "balcony", title: "Cove Balcony", fare: 763, detail: "Deck 5. This sheltered private balcony sits close to the waterline for intimate ocean views. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-lido-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Lido Deck", fare: 776, detail: "Deck 16, forward, near the main Lido pool and buffet area. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-deck-10-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Deck 10", fare: 778, detail: "Deck 10, forward. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-decks-10-11-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Decks 10 and 11", fare: 779, detail: "Deck 10, mid ship, or Deck 11, aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-decks-11-12-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Decks 11 and 12", fare: 783, detail: "Deck 11, mid ship, or Deck 12, aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-decks-12-14-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Decks 12 and 14", fare: 786, detail: "Deck 12, mid ship, or Deck 14, aft. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-decks-14-15-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Decks 14 and 15", fare: 789, detail: "Deck 14, mid ship, or Deck 15, aft or forward. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "standard-balcony-decks-15-16-2", occupancy: 2, roomType: "balcony", title: "Standard Balcony, Decks 15 and 16", fare: 793, detail: "Deck 15, mid ship, near the main Lido pool and buffet area, or Deck 16, forward. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "forward-view-balcony-2", occupancy: 2, roomType: "balcony", title: "Forward View Extended Balcony", fare: 803, detail: "A forward facing extended balcony at the front of the ship. Specify Lido, 10, 11, 12, 14, or 15 as your preferred deck. Wendy confirms live availability before booking." },
  { id: "extended-balcony-decks-10-11-2", occupancy: 2, roomType: "balcony", title: "Extended Balcony, Decks 10 and 11", fare: 971, detail: "Deck 10 or Deck 11, mid ship, with a larger private balcony. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "extended-balcony-decks-12-15-2", occupancy: 2, roomType: "balcony", title: "Extended Balcony, Decks 12, 14, and 15", fare: 972, detail: "Deck 12, 14, or 15, mid ship, with a larger private balcony. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "aft-view-balcony-2", occupancy: 2, roomType: "balcony", title: "Aft View Extended Balcony", fare: 828, detail: "Deck 9, 10, or 11 at the rear of the ship, with an extended balcony and ship wake views. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "havana-cabana-2", occupancy: 2, roomType: "balcony", title: "Havana Cabana", fare: 1154, detail: "Verandah Deck. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "havana-extended-cabana-2", occupancy: 2, roomType: "balcony", title: "Havana Extended Cabana", fare: 1169, detail: "Verandah Deck. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "ocean-suite-lido-2", occupancy: 2, roomType: "suite", title: "Ocean Suite, Lido Deck", fare: 1359, detail: "Deck 16 with a private ocean view balcony, additional sitting space, and suite benefits. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "ocean-suite-premium-2", occupancy: 2, roomType: "suite", title: "Ocean Suite, premium location", fare: 1539, detail: "Deck 15 or Deck 16 with a private ocean view balcony, additional sitting space, and suite benefits. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "cloud-9-spa-suite-2", occupancy: 2, roomType: "suite", title: "Cloud 9 Spa Suite", fare: 1579, detail: "Deck 17. Wendy confirms the final placement, taxes, eligible spa benefits, and live availability before booking." },
  { id: "excel-corner-suite-2", occupancy: 2, roomType: "suite", title: "Carnival Excel Corner Suite", fare: 2129, detail: "A spacious corner suite with a large wraparound balcony, Loft 19 access, and suite benefits. Wendy confirms the final placement, taxes, and live availability before booking." },
  { id: "interior-atlantic-3", occupancy: 3, roomType: "interior", title: "Atlantic Deck", fare: 599, detail: "Deck 4, mid ship. Availability depends on the specific bedding configuration. Wendy confirms the final placement before booking." },
  { id: "interior-promenade-3", occupancy: 3, roomType: "interior", title: "Promenade Deck", fare: 601, detail: "Deck 5, mid ship. Availability depends on the specific bedding configuration. Wendy confirms the final placement before booking." },
  { id: "interior-lido-3", occupancy: 3, roomType: "interior", title: "Lido Deck", fare: 603, detail: "Deck 16, aft. Availability depends on the specific bedding configuration. Wendy confirms the final placement before booking." },
  { id: "interior-deck-10-3", occupancy: 3, roomType: "interior", title: "Deck 10", fare: 606, detail: "Deck 10, forward. Wendy confirms the final placement and live availability before booking." },
  { id: "interior-deck-12-3", occupancy: 3, roomType: "interior", title: "Deck 12", fare: 613, detail: "Deck 12, aft. Wendy confirms the final placement and live availability before booking." },
  { id: "interior-decks-11-12-3", occupancy: 3, roomType: "interior", title: "Decks 11 and 12", fare: 529, detail: "Deck 11, mid ship, or Deck 12, forward. Wendy confirms the final placement and live availability before booking." },
  { id: "interior-decks-12-14-3", occupancy: 3, roomType: "interior", title: "Decks 12 and 14", fare: 616, detail: "Deck 12, mid ship, or Deck 14, aft. Wendy confirms the final placement and live availability before booking." },
  { id: "interior-decks-14-15-3", occupancy: 3, roomType: "interior", title: "Decks 14 and 15", fare: 619, detail: "Deck 14, mid ship, or Deck 15, aft. Wendy confirms the final placement and live availability before booking." },
  { id: "family-harbor-interior-3", occupancy: 3, roomType: "interior", title: "Family Harbor", fare: 633, detail: "Deck 4, mid ship. Family Harbor benefits include lounge breakfast and snacks, family movies, games, selected children’s specialty dining, and one Night Owls evening, subject to current cruise line terms." },
  { id: "premium-interior-3", occupancy: 3, roomType: "interior", title: "Premium Interior", fare: 635, detail: "A more spacious windowless interior with a sitting area and sofa. Deck 4 or 5, forward or mid ship. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "premium-interior-forward-3", occupancy: 3, roomType: "interior", title: "Premium Interior, forward", fare: 642, detail: "A more spacious windowless interior with a sitting area and sofa. Available on Deck 11, 12, 14, or 15 at the front of the ship. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "havana-interior-3", occupancy: 3, roomType: "interior", title: "Havana Interior", fare: 646, detail: "Deck 8, forward, near the Havana Bar and Pool. Guests in a Havana stateroom must be at least 12. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "ocean-view-atlantic-3", occupancy: 3, roomType: "ocean_view", title: "Atlantic Deck", fare: 693, detail: "Deck 4, mid ship. Wendy confirms the final placement and live availability before booking." },
  { id: "ocean-view-promenade-3", occupancy: 3, roomType: "ocean_view", title: "Promenade Deck", fare: 597, detail: "Deck 5, mid ship. Wendy confirms the final placement and live availability before booking." },
  { id: "family-harbor-ocean-view-3", occupancy: 3, roomType: "ocean_view", title: "Family Harbor Ocean View", fare: 715, detail: "Deck 4 with a large ocean view window and access to the Family Harbor Lounge. Specific bedding determines whether the cabin can accommodate your household." },
  { id: "cove-balcony-3", occupancy: 3, roomType: "balcony", title: "Cove Balcony", fare: 763, detail: "Deck 5. This sheltered private balcony sits close to the waterline. Specific bedding determines whether the cabin can accommodate your household." },
  { id: "standard-balcony-lido-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Lido Deck", fare: 776, detail: "Deck 16, forward, near the main Lido pool and buffet area. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-deck-10-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Deck 10", fare: 778, detail: "Deck 10, forward. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-decks-10-11-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Decks 10 and 11", fare: 779, detail: "Deck 10, mid ship, or Deck 11, aft. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-decks-11-12-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Decks 11 and 12", fare: 783, detail: "Deck 11, mid ship, or Deck 12, aft. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-decks-12-14-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Decks 12 and 14", fare: 786, detail: "Deck 12, mid ship, or Deck 14, aft. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-decks-14-15-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Decks 14 and 15", fare: 789, detail: "Deck 14, mid ship, or Deck 15, aft or forward. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "standard-balcony-decks-15-16-3", occupancy: 3, roomType: "balcony", title: "Standard Balcony, Decks 15 and 16", fare: 793, detail: "Deck 15, mid ship, near the main Lido pool and buffet area, or Deck 16, forward. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "forward-view-balcony-3", occupancy: 3, roomType: "balcony", title: "Forward View Extended Balcony", fare: 803, detail: "A forward facing extended balcony at the front of the ship. Wendy confirms the available deck, final placement, and bedding configuration before booking." },
  { id: "interior-atlantic-4", occupancy: 4, roomType: "interior", title: "Atlantic Deck", fare: 519, detail: "Deck 4, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-promenade-4", occupancy: 4, roomType: "interior", title: "Promenade Deck", fare: 521, detail: "Deck 5, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-lido-4", occupancy: 4, roomType: "interior", title: "Lido Deck", fare: 522, detail: "Deck 16, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-deck-10-4", occupancy: 4, roomType: "interior", title: "Deck 10", fare: 524, detail: "Deck 10, mid ship, or Lido Deck, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-decks-11-12-4", occupancy: 4, roomType: "interior", title: "Decks 11 and 12", fare: 529, detail: "Deck 11, forward, or Deck 10, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-decks-12-14-4", occupancy: 4, roomType: "interior", title: "Decks 12 and 14", fare: 532, detail: "Deck 12, mid ship, or Deck 14, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-decks-14-15-4", occupancy: 4, roomType: "interior", title: "Decks 14 and 15", fare: 534, detail: "Deck 14, mid ship, or Deck 15, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "interior-decks-15-16-4", occupancy: 4, roomType: "interior", title: "Decks 15 and 16", fare: 542, detail: "Deck 15 or Deck 16, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "family-harbor-interior-4", occupancy: 4, roomType: "interior", title: "Family Harbor", fare: 544, detail: "Deck 4, mid ship. Family Harbor benefits apply subject to current cruise line terms, and specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "premium-interior-4", occupancy: 4, roomType: "interior", title: "Premium Interior", fare: 546, detail: "A more spacious windowless interior with a sitting area and sofa. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "premium-interior-forward-4", occupancy: 4, roomType: "interior", title: "Premium Interior, forward", fare: 551, detail: "A more spacious windowless interior with a sitting area and sofa. Wendy confirms the final placement and bedding configuration before booking." },
  { id: "ocean-view-atlantic-4", occupancy: 4, roomType: "ocean_view", title: "Atlantic Deck", fare: 589, detail: "Deck 4, mid ship. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "family-harbor-ocean-view-4", occupancy: 4, roomType: "ocean_view", title: "Family Harbor Ocean View", fare: 606, detail: "Deck 4 with a large ocean view window and access to the Family Harbor Lounge. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "cove-balcony-4", occupancy: 4, roomType: "balcony", title: "Cove Balcony", fare: 642, detail: "Deck 5. This sheltered private balcony sits close to the waterline. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-lido-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Lido Deck", fare: 652, detail: "Deck 16, forward, near the main Lido pool and buffet area. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-deck-10-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Deck 10", fare: 653, detail: "Deck 10, forward. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-decks-10-11-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Decks 10 and 11", fare: 654, detail: "Deck 10, mid ship, or Deck 11, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-decks-11-12-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Decks 11 and 12", fare: 657, detail: "Deck 11, mid ship, or Deck 12, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-decks-12-14-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Decks 12 and 14", fare: 659, detail: "Deck 12, mid ship, or Deck 14, aft. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-decks-14-15-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Decks 14 and 15", fare: 662, detail: "Deck 14, mid ship, or Deck 15, aft or forward. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "standard-balcony-decks-15-16-4", occupancy: 4, roomType: "balcony", title: "Standard Balcony, Decks 15 and 16", fare: 664, detail: "Deck 15, mid ship, near the main Lido pool and buffet area, or Deck 16, forward. Specific bedding determines whether the cabin can accommodate four travelers." },
  { id: "ocean-suite-lido-4", occupancy: 4, roomType: "suite", title: "Ocean Suite, Lido Deck", fare: 964, detail: "Deck 16 with a private ocean view balcony and suite benefits. Specific bedding determines whether the suite can accommodate four travelers." },
  { id: "ocean-suite-premium-4", occupancy: 4, roomType: "suite", title: "Ocean Suite, premium location", fare: 1054, detail: "Deck 16 with a private ocean view balcony and suite benefits. Specific bedding determines whether the suite can accommodate four travelers." },
  { id: "excel-suite-4", occupancy: 4, roomType: "suite", title: "Carnival Excel Suite", fare: 1247, detail: "Deck 11 or Deck 12 with Loft 19 access and suite benefits. Specific bedding determines whether the suite can accommodate four travelers." },
];

const roomTypeLabels: Record<RoomType, string> = { interior: "Interior", ocean_view: "Ocean View", balcony: "Balcony", suite: "Suite" };
const wifiPlans = [
  { id: "none", label: "No Wi Fi plan", perDay: 0 },
  { id: "social", label: "Social", perDay: 20.4 },
  { id: "value", label: "Value", perDay: 23.8 },
  { id: "premium", label: "Premium", perDay: 25.5 },
  { id: "premium_hub", label: "Premium with HUB Chat", perDay: 32.5 },
  { id: "premium_multi", label: "Premium multi device", perDay: 90 },
];
const diningChoices = ["No dining preference", "Fahrenheit 555 Steakhouse", "JiJi Asian Kitchen", "Cucina del Capitano, additional visit", "Bonsai Teppanyaki dinner", "Bonsai Teppanyaki lunch", "Rudi’s Seagrill", "Il Viaggio", "Chef’s Table"];
const diningRates: Record<string, { adult: number; child: number; note: string }> = {
  "No dining preference": { adult: 0, child: 0, note: "Choose a restaurant to include a planning reference." },
  "Fahrenheit 555 Steakhouse": { adult: 52, child: 15, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "JiJi Asian Kitchen": { adult: 24, child: 11, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "Cucina del Capitano, additional visit": { adult: 8, child: 8, note: "Mardi Gras additional visit planning reference. Wendy confirms the current rule." },
  "Bonsai Teppanyaki dinner": { adult: 49, child: 49, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "Bonsai Teppanyaki lunch": { adult: 39, child: 39, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "Rudi’s Seagrill": { adult: 52, child: 15, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "Il Viaggio": { adult: 42, child: 14, note: "Current published planning reference. Wendy confirms the 2027 price." },
  "Chef’s Table": { adult: 95, child: 0, note: "Ages 12 and older. Wendy confirms the current sailing price and availability." },
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function calculateGrimsleyEstimate(input: { occupancy: 2 | 3 | 4; roomType: RoomType; categoryId: string; protection: boolean; wifiPlanId: string; wifiUsers: number; cheersAdults: number; diningExperience?: string; diningAdults?: number; diningChildren?: number }) {
  const choices = cabinCategories.filter((category) => category.occupancy === input.occupancy && category.roomType === input.roomType);
  const selectedCategory = choices.find((category) => category.id === input.categoryId) || choices[0];
  const wifiPlan = wifiPlans.find((plan) => plan.id === input.wifiPlanId) || wifiPlans[0];
  const protectionPerTraveler = input.roomType === "suite" ? 139 : input.roomType === "balcony" ? 109 : 95;
  const gratuityPerTraveler = input.roomType === "suite" ? 76 : 68;
  const fareCents = Math.round((selectedCategory?.fare || 0) * input.occupancy * 100);
  const gratuitiesCents = gratuityPerTraveler * input.occupancy * 100;
  const protectionCents = input.protection ? protectionPerTraveler * input.occupancy * 100 : 0;
  const wifiCents = Math.round(wifiPlan.perDay * 4 * input.wifiUsers * 100);
  const cheersCents = Math.round(83.94 * 4 * input.cheersAdults * 100);
  const diningRate = diningRates[input.diningExperience || "No dining preference"] || diningRates["No dining preference"];
  const diningCents = Math.round((diningRate.adult * (input.diningAdults || 0) + diningRate.child * (input.diningChildren || 0)) * 100);
  const cabinTotalCents = fareCents + gratuitiesCents + protectionCents;
  const extrasTotalCents = wifiCents + cheersCents + diningCents;
  return { selectedCategory, wifiPlan, diningRate, protectionPerTraveler, fareCents, gratuitiesCents, protectionCents, diningCents, cabinTotalCents, extrasTotalCents, tripTotalCents: cabinTotalCents + extrasTotalCents };
}

export default function GrimsleyCabinEstimator({ onPlanningChange }: { onPlanningChange: (snapshot: GrimsleyPlanningSnapshot) => void }) {
  const [occupancy, setOccupancy] = useState<2 | 3 | 4>(2);
  const [roomType, setRoomType] = useState<RoomType>("interior");
  const choices = useMemo(() => cabinCategories.filter((category) => category.occupancy === occupancy && category.roomType === roomType), [occupancy, roomType]);
  const [categoryId, setCategoryId] = useState(choices[0]?.id || "");
  const [protection, setProtection] = useState(false);
  const [wifiPlanId, setWifiPlanId] = useState("none");
  const [wifiUsers, setWifiUsers] = useState(1);
  const [cheersAdults, setCheersAdults] = useState(0);
  const [diningExperience, setDiningExperience] = useState("No dining preference");
  const [diningAdults, setDiningAdults] = useState(0);
  const [diningChildren, setDiningChildren] = useState(0);

  useEffect(() => { setCategoryId(choices[0]?.id || ""); }, [choices]);
  const calculation = useMemo(() => calculateGrimsleyEstimate({ occupancy, roomType, categoryId, protection, wifiPlanId, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren }), [occupancy, roomType, categoryId, protection, wifiPlanId, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren]);
  const { selectedCategory, wifiPlan, diningRate, protectionPerTraveler, fareCents, gratuitiesCents, protectionCents, diningCents, cabinTotalCents, extrasTotalCents, tripTotalCents } = calculation;

  useEffect(() => {
    if (!selectedCategory) return;
    onPlanningChange({
      occupancy,
      roomType,
      selectedCabinCategory: selectedCategory.title,
      estimatedFareCents: fareCents,
      estimatedGratuitiesCents: gratuitiesCents,
      estimatedProtectionCents: protectionCents,
      extras: { wifiPlan: wifiPlan.label, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren, diningTotalCents: diningCents },
      estimate: { cabinTotalCents, extrasTotalCents, tripTotalCents, depositCents: occupancy * 5000, onboardCreditCents: 0 },
    });
  }, [occupancy, roomType, selectedCategory, fareCents, gratuitiesCents, protectionCents, wifiPlan.label, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren, cabinTotalCents, extrasTotalCents, tripTotalCents, onPlanningChange]);

  return <section className="page-section page-section--ink" id="estimate"><div className="page-wrap">
    <div className="section-heading"><div><p className="eyebrow">Cabin and extras planner</p><h2 className="display display--medium">Build a starting point for your <em>household.</em></h2></div><p className="body-copy">Select a verified planning category, then explore extras separately. This is a reference estimate, not a live quote. Wendy will personally confirm the current price, taxes, terms, deck, and cabin location.</p></div>
    <div className="cruise-estimator">
      <div className="cruise-estimator__controls">
        <div className="estimator-step"><span>01</span><div><label htmlFor="estimateOccupancy">Travelers in this cabin</label><select id="estimateOccupancy" value={occupancy} onChange={(event) => setOccupancy(Number(event.target.value) as 2 | 3 | 4)}><option value={2}>2 travelers</option><option value={3}>3 travelers</option><option value={4}>4 travelers</option></select></div></div>
        <div className="estimator-step"><span>02</span><div><label htmlFor="estimateRoomType">Room type</label><select id="estimateRoomType" value={roomType} onChange={(event) => setRoomType(event.target.value as RoomType)}>{Object.entries(roomTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
        <div className="estimator-step estimator-step--wide"><span>03</span><div><label htmlFor="estimateCategory">Available category</label><select id="estimateCategory" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{choices.map((category) => <option key={category.id} value={category.id}>{formatCurrency(category.fare * 100)} per traveler · {category.title}</option>)}</select></div></div>
        <div className="estimator-cabin-detail"><p className="eyebrow">Selected cabin</p><h3>{selectedCategory?.title}</h3><p>{selectedCategory?.detail}</p></div>
        <label className="estimator-check"><input type="checkbox" checked={protection} onChange={(event) => setProtection(event.target.checked)} /><span><strong>Add Vacation Protection</strong><small>{formatCurrency(protectionPerTraveler * 100)} per traveler, optional</small></span></label>
      </div>
      <aside className="cruise-estimator__total"><p className="eyebrow">Reference estimate</p><strong>{formatCurrency(cabinTotalCents)}</strong><span>{formatCurrency(Math.round(cabinTotalCents / occupancy))} average per traveler</span><dl><div><dt>Cruise fare</dt><dd>{formatCurrency(fareCents)}</dd></div><div><dt>Gratuities</dt><dd>{formatCurrency(gratuitiesCents)}</dd></div><div><dt>Vacation Protection</dt><dd>{protection ? formatCurrency(protectionCents) : "Not selected"}</dd></div><div><dt>Nonrefundable deposit due to reserve</dt><dd>{formatCurrency(occupancy * 5000)}</dd></div></dl><p>Taxes or fees not reflected in the supplied fare data will be confirmed with your live quote. Fares may be recalculated if the number of travelers in the cabin changes.</p></aside>
    </div>
    <div className="extras-planner"><div><p className="eyebrow">Optional planning costs</p><h3>Explore extras now. Add them later.</h3><p>Wi Fi, CHEERS!, and specialty dining are shown separately from the cabin estimate. Wendy confirms each optional item before reservation.</p></div><div className="extras-planner__fields"><label>Wi Fi plan<select value={wifiPlanId} onChange={(event) => setWifiPlanId(event.target.value)}>{wifiPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}{plan.perDay ? `, ${formatCurrency(plan.perDay * 100)} per day` : ""}</option>)}</select></label><label>Wi Fi users<select value={wifiUsers} onChange={(event) => setWifiUsers(Number(event.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>CHEERS! eligible adults<select value={cheersAdults} onChange={(event) => setCheersAdults(Number(event.target.value))}>{Array.from({ length: occupancy + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Specialty dining preference<select value={diningExperience} onChange={(event) => setDiningExperience(event.target.value)}>{diningChoices.map((choice) => <option key={choice}>{choice}</option>)}</select></label><label>Dining adults<select value={diningAdults} onChange={(event) => { const nextAdults = Number(event.target.value); setDiningAdults(nextAdults); setDiningChildren((current) => Math.min(current, occupancy - nextAdults)); }}>{Array.from({ length: occupancy + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Dining children<select value={diningChildren} onChange={(event) => setDiningChildren(Number(event.target.value))}>{Array.from({ length: occupancy - diningAdults + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label></div><aside><span>Optional extras selected</span><strong>{formatCurrency(extrasTotalCents)}</strong><p>Estimated vacation total</p><b>{formatCurrency(tripTotalCents)}</b><small>{diningExperience === "No dining preference" ? "Select a restaurant to add a specialty-dining planning cost." : `${diningExperience}: ${formatCurrency(diningCents)}. ${diningRate.note}`}</small></aside></div>
  </div></section>;
}
