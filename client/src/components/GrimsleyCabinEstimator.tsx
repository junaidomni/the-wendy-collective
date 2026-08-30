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
  [2, "interior", "Interior, Atlantic Deck", 689], [2, "interior", "Interior, Promenade Deck", 692], [2, "interior", "Interior, Deck 9 location", 694], [2, "interior", "Interior, Decks 9 to 10", 699], [2, "interior", "Interior, Decks 10 to 11", 704], [2, "interior", "Interior, Decks 11 to 12", 709], [2, "interior", "Interior, Decks 12 to 14", 714], [2, "interior", "Interior, Decks 14 to 15", 719], [2, "interior", "Interior, Decks 15 to 16, Lido area", 734], [2, "interior", "Cloud 9 Spa Interior", 749], [2, "interior", "Cloud 9 Spa Interior, premium location", 754], [2, "interior", "Havana Interior", 759],
  [2, "ocean_view", "Ocean View, Atlantic Deck", 879], [2, "ocean_view", "Cloud 9 Spa Ocean View", 995],
  [2, "balcony", "Standard Balcony, Deck 9 location", 929], [2, "balcony", "Standard Balcony, Decks 9 to 10", 932], [2, "balcony", "Standard Balcony, Decks 10 to 11", 934], [2, "balcony", "Standard Balcony, Decks 11 to 12", 939], [2, "balcony", "Standard Balcony, Decks 12 to 14", 944], [2, "balcony", "Standard Balcony, Decks 14 to 15", 949], [2, "balcony", "Standard Balcony, Decks 15 to 16, Lido area", 954], [2, "balcony", "Forward View Extended Balcony", 969], [2, "balcony", "Extended Balcony", 971], [2, "balcony", "Extended Balcony, premium location", 972], [2, "balcony", "Cloud 9 Spa Cove Balcony", 978], [2, "balcony", "Aft View Extended Balcony", 999], [2, "balcony", "Cloud 9 Spa Balcony", 1009], [2, "balcony", "Cloud 9 Spa Balcony, premium location", 1069], [2, "balcony", "Aft View Extended Balcony, premium location", 1073], [2, "balcony", "Havana Cabana", 1154], [2, "balcony", "Havana Extended Cabana", 1169],
  [2, "suite", "Ocean Suite", 1359], [2, "suite", "Ocean Suite, premium location", 1539], [2, "suite", "Cloud 9 Spa Suite", 1579], [2, "suite", "Carnival Excel Corner Suite", 2059],
  [3, "interior", "Interior, Atlantic Deck", 599], [3, "interior", "Interior, Promenade Deck", 601], [3, "interior", "Interior, Deck 9 location", 603], [3, "interior", "Interior, Decks 9 to 10", 606], [3, "interior", "Interior, Decks 11 to 12", 613], [3, "interior", "Interior, Decks 12 to 14", 616], [3, "interior", "Interior, Decks 14 to 15", 619], [3, "interior", "Family Harbor Interior", 633], [3, "interior", "Premium Interior", 635], [3, "interior", "Premium Interior, alternate location", 642], [3, "interior", "Havana Interior", 646],
  [3, "ocean_view", "Ocean View, Atlantic Deck", 693], [3, "ocean_view", "Family Harbor Ocean View", 715],
  [3, "balcony", "Cove Balcony", 763], [3, "balcony", "Junior Balcony", 769], [3, "balcony", "Standard Balcony, Deck 9 location", 776], [3, "balcony", "Standard Balcony, Decks 9 to 10", 778], [3, "balcony", "Standard Balcony, Decks 10 to 11", 779], [3, "balcony", "Standard Balcony, Decks 11 to 12", 783], [3, "balcony", "Standard Balcony, Decks 12 to 14", 786], [3, "balcony", "Standard Balcony, Decks 14 to 15", 789], [3, "balcony", "Standard Balcony, Decks 15 to 16, Lido area", 793], [3, "balcony", "Forward View Extended Balcony", 803], [3, "balcony", "Extended Balcony", 804], [3, "balcony", "Aft View Extended Balcony", 823],
  [3, "suite", "Carnival Excel Suite", 1473],
  [4, "interior", "Interior, Atlantic Deck", 519], [4, "interior", "Interior, Promenade Deck", 521], [4, "interior", "Interior, Deck 9 location", 522], [4, "interior", "Interior, Decks 9 to 10", 524], [4, "interior", "Interior, Decks 10 to 11", 527], [4, "interior", "Interior, Decks 11 to 12", 529], [4, "interior", "Interior, Decks 12 to 14", 532], [4, "interior", "Interior, Decks 14 to 15", 534], [4, "interior", "Interior, Decks 15 to 16, Lido area", 542], [4, "interior", "Family Harbor Interior", 544], [4, "interior", "Premium Interior", 546], [4, "interior", "Premium Interior, alternate location", 551],
  [4, "ocean_view", "Ocean View, Atlantic Deck", 589], [4, "ocean_view", "Ocean View, Promenade Deck", 597], [4, "ocean_view", "Family Harbor Ocean View", 606],
  [4, "balcony", "Standard Balcony, Deck 9 location", 652], [4, "balcony", "Standard Balcony, Decks 9 to 10", 653], [4, "balcony", "Standard Balcony, Decks 10 to 11", 654], [4, "balcony", "Standard Balcony, Decks 11 to 12", 657], [4, "balcony", "Standard Balcony, Decks 12 to 14", 659], [4, "balcony", "Standard Balcony, Decks 14 to 15", 662], [4, "balcony", "Standard Balcony, Decks 15 to 16, Lido area", 664], [4, "balcony", "Extended Balcony", 673], [4, "balcony", "Extended Balcony, alternate location", 673],
  [4, "suite", "Ocean Suite", 964], [4, "suite", "Ocean Suite, premium location", 1054], [4, "suite", "Carnival Excel Suite", 1247],
].map(([occupancy, roomType, title, fare], index) => ({
  id: `cabin-${index}`,
  occupancy: occupancy as 2 | 3 | 4,
  roomType: roomType as RoomType,
  title: title as string,
  fare: fare as number,
  detail: "Wendy confirms the final deck, placement, taxes, and live availability before booking.",
}));

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

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function calculateGrimsleyEstimate(input: { occupancy: 2 | 3 | 4; roomType: RoomType; categoryId: string; protection: boolean; wifiPlanId: string; wifiUsers: number; cheersAdults: number }) {
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
  const cabinTotalCents = fareCents + gratuitiesCents + protectionCents;
  const extrasTotalCents = wifiCents + cheersCents;
  return { selectedCategory, wifiPlan, protectionPerTraveler, fareCents, gratuitiesCents, protectionCents, cabinTotalCents, extrasTotalCents, tripTotalCents: cabinTotalCents + extrasTotalCents };
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
  const calculation = useMemo(() => calculateGrimsleyEstimate({ occupancy, roomType, categoryId, protection, wifiPlanId, wifiUsers, cheersAdults }), [occupancy, roomType, categoryId, protection, wifiPlanId, wifiUsers, cheersAdults]);
  const { selectedCategory, wifiPlan, protectionPerTraveler, fareCents, gratuitiesCents, protectionCents, cabinTotalCents, extrasTotalCents, tripTotalCents } = calculation;

  useEffect(() => {
    if (!selectedCategory) return;
    onPlanningChange({
      occupancy,
      roomType,
      selectedCabinCategory: selectedCategory.title,
      estimatedFareCents: fareCents,
      estimatedGratuitiesCents: gratuitiesCents,
      estimatedProtectionCents: protectionCents,
      extras: { wifiPlan: wifiPlan.label, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren },
      estimate: { cabinTotalCents, extrasTotalCents, tripTotalCents, depositCents: occupancy * 5000, onboardCreditCents: 0 },
    });
  }, [occupancy, roomType, selectedCategory, fareCents, gratuitiesCents, protectionCents, wifiPlan.label, wifiUsers, cheersAdults, diningExperience, diningAdults, diningChildren, cabinTotalCents, extrasTotalCents, tripTotalCents, onPlanningChange]);

  return <section className="page-section page-section--ink" id="estimate"><div className="page-wrap">
    <div className="section-heading"><div><p className="eyebrow">Cabin and extras planner</p><h2 className="display display--medium">Build a starting point for your <em>household.</em></h2></div><p className="body-copy">Select a verified planning category, then explore extras separately. This is a reference estimate, not a live quote. Wendy will personally confirm the current price, taxes, terms, deck, and cabin location.</p></div>
    <div className="cruise-estimator">
      <div className="cruise-estimator__controls">
        <div className="estimator-step"><span>01</span><div><label htmlFor="estimateOccupancy">Travelers in this cabin</label><select id="estimateOccupancy" value={occupancy} onChange={(event) => setOccupancy(Number(event.target.value) as 2 | 3 | 4)}><option value={2}>2 travelers</option><option value={3}>3 travelers</option><option value={4}>4 travelers</option></select></div></div>
        <div className="estimator-step"><span>02</span><div><label htmlFor="estimateRoomType">Room type</label><select id="estimateRoomType" value={roomType} onChange={(event) => setRoomType(event.target.value as RoomType)}>{Object.entries(roomTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
        <div className="estimator-step estimator-step--wide"><span>03</span><div><label htmlFor="estimateCategory">Available category</label><select id="estimateCategory" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{choices.map((category) => <option key={category.id} value={category.id}>{category.title}, {formatCurrency(category.fare * 100)} per traveler</option>)}</select></div></div>
        <div className="estimator-cabin-detail"><p className="eyebrow">Selected cabin</p><h3>{selectedCategory?.title}</h3><p>{selectedCategory?.detail}</p></div>
        <label className="estimator-check"><input type="checkbox" checked={protection} onChange={(event) => setProtection(event.target.checked)} /><span><strong>Add Vacation Protection</strong><small>{formatCurrency(protectionPerTraveler * 100)} per traveler, optional</small></span></label>
      </div>
      <aside className="cruise-estimator__total"><p className="eyebrow">Reference estimate</p><strong>{formatCurrency(cabinTotalCents)}</strong><span>{formatCurrency(Math.round(cabinTotalCents / occupancy))} average per traveler</span><dl><div><dt>Cruise fare</dt><dd>{formatCurrency(fareCents)}</dd></div><div><dt>Gratuities</dt><dd>{formatCurrency(gratuitiesCents)}</dd></div><div><dt>Vacation Protection</dt><dd>{protection ? formatCurrency(protectionCents) : "Not selected"}</dd></div></dl><p>Taxes or fees not reflected in the supplied fare data will be confirmed with your live quote.</p></aside>
    </div>
    <div className="extras-planner"><div><p className="eyebrow">Optional planning costs</p><h3>Explore extras now. Add them later.</h3><p>Wi Fi and CHEERS! are shown separately from the cabin estimate. Specialty dining is saved as a preference for Wendy to quote.</p></div><div className="extras-planner__fields"><label>Wi Fi plan<select value={wifiPlanId} onChange={(event) => setWifiPlanId(event.target.value)}>{wifiPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}{plan.perDay ? `, ${formatCurrency(plan.perDay * 100)} per day` : ""}</option>)}</select></label><label>Wi Fi users<select value={wifiUsers} onChange={(event) => setWifiUsers(Number(event.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>CHEERS! eligible adults<select value={cheersAdults} onChange={(event) => setCheersAdults(Number(event.target.value))}>{Array.from({ length: occupancy + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Specialty dining preference<select value={diningExperience} onChange={(event) => setDiningExperience(event.target.value)}>{diningChoices.map((choice) => <option key={choice}>{choice}</option>)}</select></label><label>Dining adults<select value={diningAdults} onChange={(event) => setDiningAdults(Number(event.target.value))}>{Array.from({ length: occupancy + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Dining children<select value={diningChildren} onChange={(event) => setDiningChildren(Number(event.target.value))}>{Array.from({ length: occupancy + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label></div><aside><span>Optional extras selected</span><strong>{formatCurrency(extrasTotalCents)}</strong><p>Estimated vacation total</p><b>{formatCurrency(tripTotalCents)}</b><small>Specialty dining is a saved preference and is not included in this number.</small></aside></div>
  </div></section>;
}
