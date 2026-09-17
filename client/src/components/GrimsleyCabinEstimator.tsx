import { useEffect, useMemo, useState } from "react";

type RoomType = "interior" | "ocean_view" | "balcony" | "suite";

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
    priorCarnivalGuest: boolean;
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

const roomTypeLabels: Record<RoomType, string> = {
  interior: "Inside cabin",
  ocean_view: "Ocean View cabin",
  balcony: "Balcony cabin",
  suite: "Suite",
};

const wifiPlans = [
  { id: "none", label: "No Wi Fi plan", perDay: 0 },
  { id: "social", label: "Social", perDay: 20.4 },
  { id: "value", label: "Value", perDay: 23.8 },
  { id: "premium", label: "Premium", perDay: 25.5 },
  { id: "premium_hub", label: "Premium with HUB Chat", perDay: 32.5 },
  { id: "premium_multi", label: "Premium multi device", perDay: 90 },
];

const diningChoices = [
  "No dining preference",
  "Fahrenheit 555 Steakhouse",
  "JiJi Asian Kitchen",
  "Cucina del Capitano, additional visit",
  "Bonsai Teppanyaki dinner",
  "Bonsai Teppanyaki lunch",
  "Rudi’s Seagrill",
  "Il Viaggio",
  "Chef’s Table",
];

const diningRates: Record<
  string,
  { adult: number; child: number; note: string }
> = {
  "No dining preference": {
    adult: 0,
    child: 0,
    note: "Choose a restaurant to include a planning reference.",
  },
  "Fahrenheit 555 Steakhouse": {
    adult: 52,
    child: 15,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "JiJi Asian Kitchen": {
    adult: 24,
    child: 11,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "Cucina del Capitano, additional visit": {
    adult: 8,
    child: 8,
    note: "Mardi Gras additional visit planning reference. Wendy confirms the current rule.",
  },
  "Bonsai Teppanyaki dinner": {
    adult: 49,
    child: 49,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "Bonsai Teppanyaki lunch": {
    adult: 39,
    child: 39,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "Rudi’s Seagrill": {
    adult: 52,
    child: 15,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "Il Viaggio": {
    adult: 42,
    child: 14,
    note: "Current published planning reference. Wendy confirms the 2027 price.",
  },
  "Chef’s Table": {
    adult: 95,
    child: 0,
    note: "Ages 12 and older. Wendy confirms the current sailing price and availability.",
  },
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function calculateGrimsleyDepositCents(
  occupancy: number,
  priorCarnivalGuest = false
) {
  return occupancy * (priorCarnivalGuest ? 5000 : 7500);
}

export function calculateGrimsleyEstimate(input: {
  occupancy: 2 | 3 | 4;
  wifiPlanId: string;
  wifiUsers: number;
  cheersAdults: number;
  diningExperience?: string;
  diningAdults?: number;
  diningChildren?: number;
}) {
  const wifiPlan =
    wifiPlans.find(plan => plan.id === input.wifiPlanId) || wifiPlans[0];
  const cheersCents = Math.round(83.94 * 4 * input.cheersAdults * 100);
  const wifiCents = Math.round(wifiPlan.perDay * 4 * input.wifiUsers * 100);
  const diningRate =
    diningRates[input.diningExperience || "No dining preference"] ||
    diningRates["No dining preference"];
  const diningCents = Math.round(
    (diningRate.adult * (input.diningAdults || 0) +
      diningRate.child * (input.diningChildren || 0)) *
      100
  );
  const extrasTotalCents = wifiCents + cheersCents + diningCents;

  return { wifiPlan, diningRate, diningCents, extrasTotalCents };
}

export default function GrimsleyCabinEstimator({
  onPlanningChange,
}: {
  onPlanningChange: (snapshot: GrimsleyPlanningSnapshot) => void;
}) {
  const [occupancy, setOccupancy] = useState<2 | 3 | 4>(2);
  const [roomType, setRoomType] = useState<RoomType>("interior");
  const [protection, setProtection] = useState(false);
  const [wifiPlanId, setWifiPlanId] = useState("none");
  const [wifiUsers, setWifiUsers] = useState(1);
  const [cheersAdults, setCheersAdults] = useState(0);
  const [diningExperience, setDiningExperience] = useState(
    "No dining preference"
  );
  const [diningAdults, setDiningAdults] = useState(0);
  const [diningChildren, setDiningChildren] = useState(0);
  const [priorCarnivalGuest, setPriorCarnivalGuest] = useState(false);

  const { wifiPlan, diningRate, diningCents, extrasTotalCents } = useMemo(
    () =>
      calculateGrimsleyEstimate({
        occupancy,
        wifiPlanId,
        wifiUsers,
        cheersAdults,
        diningExperience,
        diningAdults,
        diningChildren,
      }),
    [
      occupancy,
      wifiPlanId,
      wifiUsers,
      cheersAdults,
      diningExperience,
      diningAdults,
      diningChildren,
    ]
  );
  const depositCents = calculateGrimsleyDepositCents(
    occupancy,
    priorCarnivalGuest
  );

  useEffect(() => {
    onPlanningChange({
      occupancy,
      roomType,
      selectedCabinCategory: `${roomTypeLabels[roomType]} preference`,
      estimatedFareCents: 0,
      estimatedGratuitiesCents: 0,
      estimatedProtectionCents: 0,
      extras: {
        wifiPlan: wifiPlan.label,
        wifiUsers,
        cheersAdults,
        diningExperience,
        diningAdults,
        diningChildren,
        diningTotalCents: diningCents,
        priorCarnivalGuest,
      },
      estimate: {
        cabinTotalCents: 0,
        extrasTotalCents,
        tripTotalCents: extrasTotalCents,
        depositCents,
        onboardCreditCents: 0,
      },
    });
  }, [
    occupancy,
    roomType,
    wifiPlan.label,
    wifiUsers,
    cheersAdults,
    diningExperience,
    diningAdults,
    diningChildren,
    diningCents,
    priorCarnivalGuest,
    extrasTotalCents,
    depositCents,
    onPlanningChange,
  ]);

  return (
    <section className="page-section page-section--ink" id="estimate">
      <div className="page-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cabin preference and extras</p>
            <h2 className="display display--medium">
              Tell Wendy what feels right for your <em>household.</em>
            </h2>
          </div>
          <p className="body-copy">
            Select a cabin preference and any optional planning items. Wendy
            will personally confirm the live cabin, deck, ship location, taxes,
            gratuities, and final total before a reservation is made.
          </p>
        </div>
        <div className="cruise-estimator">
          <div className="cruise-estimator__controls">
            <div className="estimator-step">
              <span>01</span>
              <div>
                <label htmlFor="estimateOccupancy">
                  Travelers in this cabin
                </label>
                <select
                  id="estimateOccupancy"
                  value={occupancy}
                  onChange={event =>
                    setOccupancy(Number(event.target.value) as 2 | 3 | 4)
                  }
                >
                  <option value={2}>2 travelers</option>
                  <option value={3}>3 travelers</option>
                  <option value={4}>4 travelers</option>
                </select>
              </div>
            </div>
            <div className="estimator-step">
              <span>02</span>
              <div>
                <label htmlFor="estimateRoomType">Cabin preference</label>
                <select
                  id="estimateRoomType"
                  value={roomType}
                  onChange={event =>
                    setRoomType(event.target.value as RoomType)
                  }
                >
                  {Object.entries(roomTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="estimator-cabin-detail">
              <p className="eyebrow">Your cabin preference</p>
              <h3>{roomTypeLabels[roomType]}</h3>
              <p>
                Wendy will use this preference to confirm the best current
                option, including the specific deck and forward, mid ship, or
                aft placement.
              </p>
            </div>
            <label className="estimator-check">
              <input
                type="checkbox"
                checked={protection}
                onChange={event => setProtection(event.target.checked)}
              />
              <span>
                <strong>Ask Wendy to include Vacation Protection</strong>
                <small>
                  Optional coverage details and current pricing are confirmed
                  with your live quote.
                </small>
              </span>
            </label>
            <label className="estimator-check">
              <input
                type="checkbox"
                checked={priorCarnivalGuest}
                onChange={event => setPriorCarnivalGuest(event.target.checked)}
              />
              <span>
                <strong>Prior Carnival guest</strong>
                <small>
                  Use the $50 per traveler deposit for an eligible returning
                  Carnival guest. Otherwise the deposit is $75 per traveler.
                </small>
              </span>
            </label>
          </div>
          <aside className="cruise-estimator__total">
            <p className="eyebrow">Cabin starting fares</p>
            <strong>Inside from $708 pp</strong>
            <span>Balconies from $938 pp</span>
            <dl>
              <div>
                <dt>Basis</dt>
                <dd>Double occupancy</dd>
              </div>
              <div>
                <dt>Fare status</dt>
                <dd>Subject to change</dd>
              </div>
              <div>
                <dt>Nonrefundable deposit due to reserve</dt>
                <dd>{formatCurrency(depositCents)}</dd>
              </div>
            </dl>
            <p>
              {priorCarnivalGuest
                ? "Returning Carnival guest deposit selected. Wendy will confirm eligibility before reservation."
                : "Standard deposit shown at $75 per traveler. Wendy will confirm any returning guest eligibility before reservation."}{" "}
              Fares are subject to change until deposit is secured.
            </p>
          </aside>
        </div>
        <div className="extras-planner">
          <div>
            <p className="eyebrow">Optional planning costs</p>
            <h3>Explore extras now. Add them later.</h3>
            <p>
              Wi Fi, CHEERS!, and specialty dining are shown separately from
              cabin fare. Wendy confirms each optional item before reservation.
            </p>
          </div>
          <div className="extras-planner__fields">
            <label>
              Wi Fi plan
              <select
                value={wifiPlanId}
                onChange={event => setWifiPlanId(event.target.value)}
              >
                {wifiPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.label}
                    {plan.perDay
                      ? `, ${formatCurrency(plan.perDay * 100)} per day`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Wi Fi users
              <select
                value={wifiUsers}
                onChange={event => setWifiUsers(Number(event.target.value))}
              >
                {[1, 2, 3, 4].map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              CHEERS! eligible adults
              <select
                value={cheersAdults}
                onChange={event => setCheersAdults(Number(event.target.value))}
              >
                {Array.from({ length: occupancy + 1 }, (_, value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Specialty dining preference
              <select
                value={diningExperience}
                onChange={event => setDiningExperience(event.target.value)}
              >
                {diningChoices.map(choice => (
                  <option key={choice}>{choice}</option>
                ))}
              </select>
            </label>
            <label>
              Dining adults
              <select
                value={diningAdults}
                onChange={event => {
                  const nextAdults = Number(event.target.value);
                  setDiningAdults(nextAdults);
                  setDiningChildren(current =>
                    Math.min(current, occupancy - nextAdults)
                  );
                }}
              >
                {Array.from({ length: occupancy + 1 }, (_, value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dining children
              <select
                value={diningChildren}
                onChange={event =>
                  setDiningChildren(Number(event.target.value))
                }
              >
                {Array.from(
                  { length: occupancy - diningAdults + 1 },
                  (_, value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
          <aside>
            <span>Optional extras selected</span>
            <strong>{formatCurrency(extrasTotalCents)}</strong>
            <p>Shown separately from cabin fare</p>
            <b>Wendy confirms final details</b>
            <small>
              {diningExperience === "No dining preference"
                ? "Select a restaurant to add a specialty dining planning cost."
                : `${diningExperience}: ${formatCurrency(diningCents)}. ${diningRate.note}`}
            </small>
          </aside>
        </div>
      </div>
    </section>
  );
}
