import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import GrimsleyCabinEstimator, { GrimsleyPlanningSnapshot } from "@/components/GrimsleyCabinEstimator";
import { createPortal } from "react-dom";

type Traveler = { firstName: string; middleName: string; lastName: string; age: string; dateOfBirth: string; loyaltyNumber: string };
type Room = { occupancy: number; roomType: "interior" | "ocean_view" | "balcony" | "suite"; locationPreference: "no_preference" | "forward" | "midship" | "aft"; travelers: Traveler[] };
type Contact = { firstName: string; lastName: string; email: string; phone: string; notes: string; consent: boolean };
type AmenityValue = "wifi" | "beverage_package" | "soda_package" | "specialty_dining" | "travel_protection" | "transfers";
type RateQualifier = "military" | "interline" | "senior_55_plus";
type GroupProfile = { title: string; organizationName: string; groupKey: string; groupTerms: string | null; roomStrategy: string | null; bookingWindow: string | null };
type CruiseExperience = { cruiseLine: string; shipName: string; embarkPort: string; sailingSummary: string; heroImageUrl: string | null; heroImageAlt: string | null; itineraryJson: string | null; roomGuidance: string | null; shipFactsJson?: string | null; amenitiesJson?: string | null };
type StoredTraveler = { firstName: string; middleName: string | null; lastName: string; age: number; dateOfBirth: string | null; loyaltyNumber: string | null };
export type FamilyCabinRequest = { id: number; revisionNumber: number; status: string; createdAt: Date; contactFirstName: string; contactLastName: string; email: string; phone: string; amenitiesJson: string | null; extrasJson: string | null; estimateJson: string | null; notes: string | null; rooms: Array<{ occupancy: number; roomType: Room["roomType"]; locationPreference: Room["locationPreference"]; travelers: StoredTraveler[] }> };
type FamilySubmission = { familyPortalToken: string; revisionNumber: number };

const blankTraveler = (): Traveler => ({ firstName: "", middleName: "", lastName: "", age: "", dateOfBirth: "", loyaltyNumber: "" });
const blankRoom = (occupancy = 2): Room => ({ occupancy, roomType: "interior", locationPreference: "no_preference", travelers: Array.from({ length: occupancy }, blankTraveler) });
const blankContact = (): Contact => ({ firstName: "", lastName: "", email: "", phone: "", notes: "", consent: false });

const itinerary = [
  ["June 24", "Port Canaveral", "Departing at 3:30 PM"],
  ["June 25", "Fun Day at Sea", "A full day to enjoy Mardi Gras"],
  ["June 26", "RelaxAway, Half Moon Cay", "8:00 AM to 4:00 PM"],
  ["June 27", "Celebration Key", "8:00 AM to 4:00 PM"],
  ["June 28", "Port Canaveral", "Arriving at 8:00 AM"],
];

const roomLabels = { interior: "Interior", ocean_view: "Ocean View", balcony: "Balcony", suite: "Suite" } as const;
const locationLabels = { no_preference: "No preference", forward: "Forward", midship: "Mid ship", aft: "Aft" } as const;
const mardiGrasHighlights = [
  { eyebrow: "Activities and recreation", title: "The Ultimate Playground", body: "SportSquare keeps the group moving with full court basketball, mini golf, a ropes course, outdoor games, and a jogging track. Recreation areas are included, subject to posted safety requirements and operating schedules." },
  { eyebrow: "Pools and outdoor fun", title: "WaterWorks and pool time", body: "Carnival WaterWorks is included and features three large waterslides, racing thrills, and splash features. Families can also enjoy pool decks and open air spaces throughout the sailing." },
  { eyebrow: "Signature thrill", title: "BOLT: Ultimate Sea Coaster", body: "The roller coaster at sea pairs a motorcycle style vehicle with speed control and open ocean views. BOLT has a separate pay per ride charge and height, weight, and safety requirements.", featured: true },
  { eyebrow: "Entertainment", title: "Shows, comedy and live music", body: "Evenings may include Playlist Productions, Family Feud Live, performances in Grand Central, The Punchliner Comedy Club, Piano Bar 88, and live music around the ship. Schedules are published for each sailing." },
  { eyebrow: "Graduates and younger travelers", title: "Age appropriate spaces", body: "Circle C serves ages 12 to 14 and Club O2 serves ages 15 to 17. Camp Ocean serves children through age 11. Guests 18 and older are young adults and follow each venue’s age rules." },
  { eyebrow: "Parents and adults", title: "Room to relax and have fun", body: "Serenity Adult Only Retreat is an included open air escape. Parents can also enjoy comedy, live music, lounges, dining, nightlife, Cloud 9 Spa treatments, casino play, and purchased beverages." },
];
const mardiGrasHeroSlides = [
  "/manus-storage/ship_3df3c21e.png",
  "/manus-storage/waterworks_14b8fa60.jpg",
  "/manus-storage/dining_aece338f.jpg",
  "/manus-storage/entertainment_a310e8d3.jpg",
  "/manus-storage/bolt_ca8c688b.jpg",
];

function parseItinerary(raw?: string | null) {
  try {
    const parsed = raw ? JSON.parse(raw) : undefined;
    if (Array.isArray(parsed)) return parsed.map((entry) => [entry.day, entry.place, entry.detail] as [string, string, string]);
  } catch { /* Fall back to the approved itinerary below. */ }
  return itinerary;
}
function parseList(raw?: string | null, fallback: string[] = []) { try { const parsed = raw ? JSON.parse(raw) : undefined; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : fallback; } catch { return fallback; } }
function parseFacts(raw?: string | null) { try { const parsed = raw ? JSON.parse(raw) : undefined; return Array.isArray(parsed) ? parsed.filter((item): item is { label: string; value: string } => typeof item?.label === "string" && typeof item?.value === "string") : []; } catch { return []; } }
function parseAmenities(raw?: string | null): AmenityValue[] { return parseList(raw).filter((item): item is AmenityValue => ["wifi", "beverage_package", "soda_package", "specialty_dining", "travel_protection", "transfers"].includes(item)); }
function parseRateQualifiers(raw?: string | null): RateQualifier[] { try { const parsed = raw ? JSON.parse(raw) : undefined; return Array.isArray(parsed?.rateQualifiers) ? parsed.rateQualifiers.filter((item: unknown): item is RateQualifier => item === "military" || item === "interline" || item === "senior_55_plus") : []; } catch { return []; } }
function cloneRequestRooms(request?: FamilyCabinRequest): Room[] { return request?.rooms.length ? request.rooms.map((room) => ({ occupancy: room.occupancy, roomType: room.roomType, locationPreference: room.locationPreference, travelers: room.travelers.map((traveler) => ({ firstName: traveler.firstName, middleName: traveler.middleName || "", lastName: traveler.lastName, age: String(traveler.age || ""), dateOfBirth: traveler.dateOfBirth || "", loyaltyNumber: traveler.loyaltyNumber || "" })) })) : [blankRoom()]; }

const familyStatusLabels: Record<string, string> = { new: "Request received", contacted: "Wendy will follow up", details_received: "Details received", quote_in_progress: "Live quote in progress", quote_shared: "Quote shared", booked: "Booked with Wendy", closed: "Request complete" };

export function SchoolCruiseContent({ privateToken, familyPortalToken, profile, experience, initialRequest, revisionCount = 0 }: { privateToken?: string; familyPortalToken?: string; profile?: GroupProfile; experience?: CruiseExperience; initialRequest?: FamilyCabinRequest; revisionCount?: number }) {
  const [contact, setContact] = useState<Contact>(() => initialRequest ? { firstName: initialRequest.contactFirstName, lastName: initialRequest.contactLastName, email: initialRequest.email, phone: initialRequest.phone, notes: initialRequest.notes || "", consent: false } : blankContact());
  const [rooms, setRooms] = useState<Room[]>(() => cloneRequestRooms(initialRequest));
  const [amenities, setAmenities] = useState<AmenityValue[]>(() => parseAmenities(initialRequest?.amenitiesJson));
  const [rateQualifiers, setRateQualifiers] = useState<RateQualifier[]>(() => parseRateQualifiers(initialRequest?.extrasJson));
  const [planning, setPlanning] = useState<GrimsleyPlanningSnapshot | null>(null);
  const [submitted, setSubmitted] = useState<FamilySubmission | null>(null);
  const cabinRequest = trpc.groupCruises.createCabinRequest.useMutation();
  useEffect(() => {
    if (!initialRequest) return;
    setContact({ firstName: initialRequest.contactFirstName, lastName: initialRequest.contactLastName, email: initialRequest.email, phone: initialRequest.phone, notes: initialRequest.notes || "", consent: false });
    setRooms(cloneRequestRooms(initialRequest));
    setAmenities(parseAmenities(initialRequest.amenitiesJson));
    setRateQualifiers(parseRateQualifiers(initialRequest.extrasJson));
    setSubmitted(null);
  }, [initialRequest]);
  const travelerCount = useMemo(() => rooms.reduce((total, room) => total + room.occupancy, 0), [rooms]);
  const displayItinerary = useMemo(() => parseItinerary(experience?.itineraryJson), [experience?.itineraryJson]);
  const shipFacts = useMemo(() => parseFacts(experience?.shipFactsJson), [experience?.shipFactsJson]);
  const amenityChoices = useMemo(() => parseList(experience?.amenitiesJson, ["WiFi", "Beverage package", "Soda package", "Specialty dining", "Travel protection"]), [experience?.amenitiesJson]);
  const groupTitle = profile?.title || "Grimsley High School Graduation Cruise 2027";
  const groupName = profile?.organizationName || "The Class of 2027";
  const shipName = experience?.shipName || "Mardi Gras";
  const sailingSummary = experience?.sailingSummary || "June 24 to 28, 2027";
  const embarkPort = experience?.embarkPort || "Port Canaveral, Florida";
  const shipImage = experience?.heroImageUrl || "/manus-storage/mardi-gras-approved_10fa6e55.png";
  const shipImageAlt = experience?.heroImageAlt || "Carnival Mardi Gras at sea near Port Canaveral";
  const savePlanning = useCallback((snapshot: GrimsleyPlanningSnapshot) => setPlanning(snapshot), []);
  const scrollToProposalSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  const updateContact = (field: keyof Contact, value: string | boolean) => setContact((current) => ({ ...current, [field]: value }));
  const updateRoom = <K extends keyof Omit<Room, "travelers">>(roomIndex: number, field: K, value: Room[K]) => {
    setRooms((current) => current.map((room, index) => {
      if (index !== roomIndex) return room;
      if (field === "occupancy") {
        const occupancy = value as number;
        return { ...room, occupancy, travelers: Array.from({ length: occupancy }, (_, travelerIndex) => room.travelers[travelerIndex] ?? blankTraveler()) };
      }
      return { ...room, [field]: value };
    }));
  };
  const updateTraveler = (roomIndex: number, travelerIndex: number, field: keyof Traveler, value: string) => {
    setRooms((current) => current.map((room, index) => index !== roomIndex ? room : {
      ...room,
      travelers: room.travelers.map((traveler, index) => index !== travelerIndex ? traveler : { ...traveler, [field]: value }),
    }));
  };
  const toggleRateQualifier = (qualifier: RateQualifier) => setRateQualifiers((current) => current.includes(qualifier) ? current.filter((item) => item !== qualifier) : [...current, qualifier]);
  const returnToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(null);
    const result = await cabinRequest.mutateAsync({
      groupKey: "grimsley-hs-graduation-cruise-2027",
      privateToken,
      familyPortalToken,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
      amenities,
      extras: { ...(planning?.extras ?? {}), rateQualifiers },
      estimate: planning?.estimate,
      consent: true,
      rooms: rooms.map((room) => ({
        ...room,
        selectedCabinCategory: planning?.selectedCabinCategory,
        estimatedFareCents: planning?.estimatedFareCents,
        estimatedGratuitiesCents: planning?.estimatedGratuitiesCents,
        estimatedProtectionCents: planning?.estimatedProtectionCents,
        travelers: room.travelers.map((traveler) => ({ ...traveler, age: Number(traveler.age) })),
      })),
    });
    if (result.familyPortalToken) setSubmitted({ familyPortalToken: result.familyPortalToken, revisionNumber: result.revisionNumber });
  };

  return <>
    <SiteShell>
    <section className="school-hero">
      <img src={shipImage} alt={shipImageAlt} />
      <div className="school-hero__film" aria-hidden="true">{mardiGrasHeroSlides.map((src, index) => <img key={src} src={src} alt="" className="school-hero__slide" style={{ animationDelay: `${index * 6}s` }} />)}</div>
      <div className="school-hero__veil" />
      <div className="page-wrap school-hero__content">
        <p className="eyebrow">{privateToken || familyPortalToken ? "Private family proposal" : groupName}</p>
        <h1 className="display">{groupTitle.replace(" 2027", "")} <em>2027.</em></h1>
        <p>{sailingSummary} · {embarkPort}</p>
        <div className="hero-actions"><a className="button-link button-link--ghost" href="https://www.carnival.com/cruise-ships/mardi-gras" target="_blank" rel="noreferrer">Explore the ship <span aria-hidden="true">↗</span></a><button type="button" className="button-link button-link--ghost" onClick={() => scrollToProposalSection("mardi-gras")}>See Mardi Gras highlights <span aria-hidden="true">↓</span></button><button type="button" className="button-link" onClick={() => scrollToProposalSection("estimate")}>Pick your cabin <span aria-hidden="true">↗</span></button></div>
        {familyPortalToken && initialRequest ? <aside className="family-status-card"><p className="eyebrow">Your request status</p><strong>{familyStatusLabels[initialRequest.status] || "Request received"}</strong><span>Latest update submitted {new Date(initialRequest.createdAt).toLocaleDateString()}</span><small>{revisionCount > 1 ? `${revisionCount} saved versions. The latest is current.` : "Your first saved request is current."}</small></aside> : null}
      </div>
    </section>

    <section className="school-facts" aria-label="Cruise overview"><div className="page-wrap school-facts__grid">
      <div><span>Cruise line</span><strong>{experience?.cruiseLine || "Carnival Cruise Line"}</strong></div><div><span>Ship</span><strong>{shipName}</strong></div><div><span>Length</span><strong>Four nights</strong></div><div><span>Two island days</span><strong>RelaxAway and Celebration Key</strong></div>
    </div></section>
    <section className="page-section school-mardi-gras" id="mardi-gras" aria-labelledby="mardi-gras-experience-title"><div className="page-wrap"><div className="school-mardi-gras__intro"><div><p className="eyebrow">Experience Mardi Gras</p><h2 className="display display--medium" id="mardi-gras-experience-title">A whole vacation is waiting <em>onboard.</em></h2></div><div><p>Mardi Gras brings together big deck thrills, live entertainment, relaxed adult spaces, and a broad dining lineup. Graduates can stay active and social while parents still have plenty of ways to unwind and enjoy the ship.</p><a className="button-link button-link--ink" href="https://www.carnival.com/cruise-ships/mardi-gras" target="_blank" rel="noreferrer">Explore Mardi Gras on Carnival <span aria-hidden="true">↗</span></a></div></div><div className="school-mardi-gras__grid">{mardiGrasHighlights.map((highlight) => <article className={highlight.featured ? "school-mardi-gras__card school-mardi-gras__card--featured" : "school-mardi-gras__card"} key={highlight.title}><p className="eyebrow">{highlight.eyebrow}{highlight.featured ? <span>Additional cost</span> : null}</p><h3>{highlight.title}</h3><p>{highlight.body}</p></article>)}</div></div></section>
    <section className="page-section school-sailing" id="journey"><div className="page-wrap"><div className="school-sailing__heading"><div><p className="eyebrow">Sailing at a glance</p><h2 className="display display--medium">Five days made for <em>celebrating.</em></h2></div><p className="body-copy">A graduation getaway with room for friends, family time, ocean air, and the kind of memories that last long after the final bell. Wendy confirms the current sailing and cabin availability before any reservation is made.</p></div>{shipFacts.length > 0 && <div className="school-sailing__facts">{shipFacts.map((fact) => <article key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></article>)}</div>}<div className="school-sailing__itinerary-label"><p className="eyebrow">Day by day</p><p>From Port Canaveral to two island days and home again.</p></div><div className="school-itinerary school-sailing__itinerary">{displayItinerary.map(([date, place, detail], index) => <article key={date}><span>Day {index + 1}</span><h3>{date}</h3><strong>{place}</strong><p>{detail}</p></article>)}</div></div></section>

    <section className="page-section"><div className="page-wrap school-inclusions"><div className="section-heading"><div><p className="eyebrow">More than a cabin</p><h2 className="display display--medium">Know what is included before you <em>decide.</em></h2></div><p className="body-copy">Mardi Gras brings together included dining, entertainment, youth programs, pools, and open deck recreation. Wendy will help you weigh optional upgrades around your household’s priorities.</p></div><div className="school-inclusions__grid"><article><p className="eyebrow">Included</p><ul><li>Selected stateroom accommodations</li><li>Main dining, buffet, and casual dining choices</li><li>Shows, comedy, music, pools, and WaterWorks</li><li>SportSquare, mini golf, and open deck recreation</li><li>Age eligible youth and teen programming</li><li>Serenity Adult Only Retreat</li></ul></article><article><p className="eyebrow">Optional planning items</p><ul><li>Vacation Protection, Wi Fi, and CHEERS!</li><li>Specialty dining and repeat restaurant visits</li><li>Shore experiences and destination upgrades</li><li>Cloud 9 Spa services, BOLT rides, and arcade play</li><li>Retail, photography, premium beverages, and casino play</li><li>Any taxes or fees not reflected in the reference fare</li></ul></article></div><div className="school-terms-strip"><div><span>Standard deposit</span><strong>$75 per traveler</strong></div><div><span>Prior Carnival guest</span><strong>$50 per traveler</strong></div><div><span>Before booking</span><strong>Wendy confirms every live detail</strong></div></div></div></section>

    <section className="page-section"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Cabin starting fares</p><h2 className="display display--medium">A simple place to begin your <em>celebration.</em></h2></div><p className="body-copy">Inside cabins start at $708 per traveler. Balcony cabins start at $938 per traveler, based on double occupancy. Fares are subject to change until deposit is secured.</p></div><div className="school-rate-grid"><article><span>Inside cabins</span><strong>From $708 pp</strong><p>Based on double occupancy</p></article><article><span>Balconies</span><strong>From $938 pp</strong><p>Based on double occupancy</p></article></div><div className="school-cabin-note"><div><span>Cabin preferences</span><p>Choose an Inside, Ocean View, Balcony, or Suite preference. Wendy will confirm the best current option for your household.</p></div><div><span>Fares and availability</span><p>Fares are subject to change until deposit is secured. Wendy confirms the live category, deck, exact ship placement, taxes, gratuities, and final total.</p></div><div><span>Deposit and changes</span><p>A nonrefundable seventy five dollar per traveler deposit is required to secure a reservation. Prior Carnival guests may use a fifty dollar per traveler deposit after Wendy confirms eligibility. Before final payment, Carnival may assess a fifty dollar per traveler service fee for cancellation or for a ship or sailing date change, plus any applicable fare difference. After final payment, standard Carnival cancellation penalties apply.</p></div></div></div></section>

    <GrimsleyCabinEstimator onPlanningChange={savePlanning} />

    <section className="page-section page-section--ink school-protection"><div className="page-wrap"><div><p className="eyebrow">Vacation Protection</p><h2 className="display display--medium">A little more confidence when plans <em>change.</em></h2></div><aside><p>Vacation Protection may include eligible trip cancellation or interruption, travel delay, baggage loss or delay, emergency medical benefits, evacuation, and around the clock assistance. Benefits, exclusions, and eligibility depend on the selected plan.</p><button type="button" className="button-link button-link--ghost" onClick={() => scrollToProposalSection("estimate")}>Add it to your estimate <span aria-hidden="true">↑</span></button></aside></div></section>

    <section className="page-section school-documents" id="documents"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Travel documents</p><h2 className="display display--medium">Travel documents made <em>simple.</em></h2></div><p className="body-copy">Wendy will help your household confirm the appropriate documents before travel. Do not upload or enter passport numbers, images, or other document details on this website.</p></div><div className="school-documents__grid"><article><p className="eyebrow">Best choice</p><h3>A passport</h3><p>A valid United States passport book is strongly recommended for every traveler. It offers the greatest flexibility if an unexpected event requires a flight home from outside the United States.</p></article><article><p className="eyebrow">Closed loop alternative</p><h3>Eligible United States travelers</h3><p>Eligible United States citizens may generally travel with an original or government certified birth certificate and a valid government issued photo ID for guests age 16 and older. Minor documentation rules also apply.</p></article><aside><strong>Confirm before booking</strong><p>Requirements vary by citizenship and residency status. Names must match reservation documents. Wendy will confirm current cruise line requirements for minors and guests under 21 before any reservation is completed.</p></aside></div></div></section>

    <section className="page-section page-section--warm school-cruise-faq" id="faq"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Frequently asked questions</p><h2 className="display display--medium">Helpful details, simply <em>answered.</em></h2></div><p className="body-copy">These answers are planning guidance. Wendy confirms the current cruise line terms, pricing, cabin placement, and eligibility before a reservation is made.</p></div><div className="school-cruise-faq__list"><details><summary>Do I need a passport?</summary><p>A passport book is strongly recommended for every traveler. Wendy can review current cruise requirements with your household before booking.</p></details><details><summary>What travel documents are required?</summary><p>Document requirements depend on citizenship, residency, age, and itinerary. Travelers should use names that match their travel documents, and Wendy will review the current requirements before reservation.</p></details><details><summary>Can graduates stay in their own cabin?</summary><p>Wendy will review the proposed rooming plan against the cruise line's current minor and age requirements before booking. Do not assume a particular arrangement is approved until Wendy confirms it.</p></details><details><summary>What is included in the fare?</summary><p>The cruise fare reference includes stateroom accommodations, selected dining, entertainment, pools, WaterWorks, recreation, and age eligible youth programming. Taxes, gratuities, upgrades, and optional items may be additional.</p></details><details><summary>Are gratuities included in the estimate?</summary><p>The displayed reference estimate includes the approved group gratuity figure. Wendy will confirm the final amount, taxes, fees, and terms with the live quote.</p></details><details><summary>Is Vacation Protection included?</summary><p>Vacation Protection is optional. You can add it to the planner as a reference cost, and Wendy will review the plan details before booking.</p></details><details><summary>Is Wi Fi or a beverage package required?</summary><p>No. Wi Fi and beverage packages are optional. The planner shows them separately so your household can decide what is worth considering.</p></details></div></div></section>

    <section className="page-section page-section--warm"><div className="page-wrap school-ready"><div><p className="eyebrow">How this works</p><h2 className="display display--medium">A clear request. A personal <em>follow up.</em></h2><p className="body-copy">{profile?.groupTerms || "Choose the rooms your household needs and share the traveler details Wendy needs to begin. Wendy will personally confirm the current cabin category, ship location, pricing, deposit, and availability before anything is booked."}</p></div><div className="school-ready__steps"><div><span>01</span><h3>Explore the reference estimate</h3><p>Choose a cabin category and optional preferences, then carry that planning reference into your request.</p></div><div><span>02</span><h3>Wendy verifies options</h3><p>She checks live availability, including the exact deck and whether your room is forward, mid ship, or aft.</p></div><div><span>03</span><h3>Book with confidence</h3><p>{profile?.bookingWindow || "Wendy reviews the live quote with you and completes the reservation only after your approval."}</p></div></div></div></section>

    <section className="page-section" id="request"><div className="page-wrap school-request-layout"><aside className="school-request-aside"><p className="eyebrow">Cabin request</p><h2 className="display display--small">Your household, thoughtfully <em>organized.</em></h2><p className="body-copy">This is a request for Wendy to review. It does not hold a cabin or create a reservation.</p><div className="school-request-aside__summary"><span>{rooms.length} {rooms.length === 1 ? "room" : "rooms"}</span><span>{travelerCount} {travelerCount === 1 ? "traveler" : "travelers"}</span></div><a href="https://www.carnival.com/cruise-ships/mardi-gras" target="_blank" rel="noreferrer" className="button-link button-link--ink">Explore Mardi Gras <span aria-hidden="true">↗</span></a></aside>
      <form className="school-request-form" onSubmit={submit}>
        <div className="form-intro"><p className="eyebrow">{familyPortalToken ? "Update your request" : "Cabin request"}</p><h2>{familyPortalToken ? "Keep your household plans current" : "Request your cabin"}</h2><p>{familyPortalToken ? "Your current details are shown below. Send a new update whenever plans change. Wendy keeps each version for careful review." : "Fields marked with an asterisk are required. Please enter traveler names exactly as they appear on travel documents."}</p>{planning && <div className="request-planning-reference"><span>Your planning reference</span><strong>{planning.selectedCabinCategory} for {planning.occupancy} travelers</strong><p>{planning.estimate.extrasTotalCents > 0 ? `Optional planning selections: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(planning.estimate.extrasTotalCents / 100)}. ` : "No optional planning costs selected. "}Cabin fare and final total are confirmed by Wendy.</p></div>}</div>
        <div className="form-grid"><div className="form-field"><label htmlFor="schoolFirstName">Primary contact first name *</label><input id="schoolFirstName" required value={contact.firstName} onChange={(event) => updateContact("firstName", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolLastName">Primary contact last name *</label><input id="schoolLastName" required value={contact.lastName} onChange={(event) => updateContact("lastName", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolEmail">Email *</label><input id="schoolEmail" type="email" required value={contact.email} onChange={(event) => updateContact("email", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolPhone">Phone *</label><input id="schoolPhone" type="tel" required value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} /></div></div>
        <div className="school-rooms">{rooms.map((room, roomIndex) => <fieldset className="school-room" key={roomIndex}><legend>Room {roomIndex + 1}</legend><div className="form-grid"><div className="form-field"><label htmlFor={`room-${roomIndex}-occupancy`}>Travelers in this room *</label><select id={`room-${roomIndex}-occupancy`} value={room.occupancy} onChange={(event) => updateRoom(roomIndex, "occupancy", Number(event.target.value))}><option value={2}>2 travelers</option><option value={3}>3 travelers</option><option value={4}>4 travelers</option></select></div><div className="form-field"><label htmlFor={`room-${roomIndex}-type`}>Cabin style *</label><select id={`room-${roomIndex}-type`} value={room.roomType} onChange={(event) => updateRoom(roomIndex, "roomType", event.target.value as Room["roomType"])}>{Object.entries(roomLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="form-field form-field--wide"><label htmlFor={`room-${roomIndex}-location`}>Preferred ship location *</label><select id={`room-${roomIndex}-location`} value={room.locationPreference} onChange={(event) => updateRoom(roomIndex, "locationPreference", event.target.value as Room["locationPreference"])}>{Object.entries(locationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="form-help">Wendy will confirm the exact deck and forward, mid ship, or aft placement with the live quote.</span></div></div>
          <div className="school-travelers">{room.travelers.map((traveler, travelerIndex) => <div className="school-traveler" key={travelerIndex}><p>Traveler {travelerIndex + 1}</p><div className="form-grid"><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-first`}>Legal first name *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-first`} required value={traveler.firstName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "firstName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-middle`}>Middle name</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-middle`} value={traveler.middleName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "middleName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-last`}>Legal last name *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-last`} required value={traveler.lastName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "lastName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-age`}>Age at sailing *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-age`} type="number" min="0" max="120" required value={traveler.age} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "age", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-birth`}>Date of birth</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-birth`} type="date" value={traveler.dateOfBirth} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "dateOfBirth", event.target.value)} /></div><div className="form-field form-field--wide"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-loyalty`}>Carnival VIFP number</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-loyalty`} value={traveler.loyaltyNumber} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "loyaltyNumber", event.target.value)} /></div></div></div>)}</div>
          {rooms.length > 1 && <button type="button" className="school-room__remove" onClick={() => setRooms((current) => current.filter((_, index) => index !== roomIndex))}>Remove this room</button>}
        </fieldset>)}</div>
        <button type="button" className="school-add-room" onClick={() => setRooms((current) => [...current, blankRoom()])} disabled={rooms.length >= 12}>Add another room <span aria-hidden="true">+</span></button>
        <fieldset className="school-rate-qualifiers"><legend>Rate qualifiers <span>optional</span></legend><p className="form-help">Select any rate category Wendy should check. A selection identifies a possible rate to review and does not guarantee a discount.</p><div><label><input type="checkbox" checked={rateQualifiers.includes("military")} onChange={() => toggleRateQualifier("military")} /> Military</label><label><input type="checkbox" checked={rateQualifiers.includes("interline")} onChange={() => toggleRateQualifier("interline")} /> Interline</label><label><input type="checkbox" checked={rateQualifiers.includes("senior_55_plus")} onChange={() => toggleRateQualifier("senior_55_plus")} /> Senior 55 plus</label></div></fieldset>
        <fieldset className="school-amenities"><legend>Optional preferences</legend><p className="form-help">Tell Wendy what your household may be interested in. These are requests only and are not included or confirmed until Wendy reviews the live quote.</p><div>{amenityChoices.map((amenity) => { const value = amenity.toLowerCase().replaceAll(" ", "_") as AmenityValue; const accepted = ["wifi", "beverage_package", "soda_package", "specialty_dining", "travel_protection", "transfers"] as AmenityValue[]; if (!accepted.includes(value)) return null; const checked = amenities.includes(value); return <label key={value}><input type="checkbox" checked={checked} onChange={() => setAmenities((current) => checked ? current.filter((item) => item !== value) : [...current, value])} /> {amenity}</label>; })}</div></fieldset>
        <div className="form-field school-notes"><label htmlFor="schoolNotes">Anything Wendy should know?</label><textarea id="schoolNotes" placeholder="Share rooming preferences, celebration notes, accessibility requests, or other non sensitive planning details." value={contact.notes} onChange={(event) => updateContact("notes", event.target.value)} /></div>
        <label className="school-consent"><input type="checkbox" checked={contact.consent} required onChange={(event) => updateContact("consent", event.target.checked)} /><span>I agree that Wendy may contact me about this cabin request. I understand that this request does not hold a cabin or create a reservation.</span></label>
        <p className="form-help">Do not enter passport numbers, payment card details, account passwords, or medical information. Read the <a href="/privacy">privacy policy</a> for details.</p>
        {submitted ? <section className="family-confirmation" role="status"><p className="eyebrow">Request received</p><h3>Thank you. Wendy will be in touch.</h3><p>{submitted.revisionNumber > 1 ? `Your update ${submitted.revisionNumber} is now the current request for Wendy to review.` : "Your household request is now with Wendy for a personal review."} This request does not hold a cabin or create a reservation.</p><a className="button-link button-link--ink" href={`/family/${submitted.familyPortalToken}`}>Review or update your request <span aria-hidden="true">↗</span></a><small>Save this link. You may return whenever your plans change.</small></section> : <button className="button-submit" type="submit" disabled={cabinRequest.isPending}>{cabinRequest.isPending ? "Sending your request…" : familyPortalToken ? "Send this update" : "Send cabin request"} <span aria-hidden="true">↗</span></button>}
        {cabinRequest.error && <p className="form-error" role="alert">Something interrupted your request. Please try again or email info@thewendycollective.com.</p>}
      </form>
    </div></section>
    </SiteShell>
    {typeof document !== "undefined" ? createPortal(<button type="button" className="school-return-top" onClick={returnToTop} aria-label="Return to the top of the Grimsley proposal"><span aria-hidden="true">↑</span> Top</button>, document.body) : null}
  </>;
}

export default function SchoolCruise() {
  return <SchoolCruiseContent />;
}
