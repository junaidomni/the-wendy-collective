import { FormEvent, useMemo, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";

type Traveler = { firstName: string; middleName: string; lastName: string; age: string; dateOfBirth: string; loyaltyNumber: string };
type Room = { occupancy: number; roomType: "interior" | "ocean_view" | "balcony" | "suite"; locationPreference: "no_preference" | "forward" | "midship" | "aft"; travelers: Traveler[] };
type Contact = { firstName: string; lastName: string; email: string; phone: string; notes: string; consent: boolean };
type AmenityValue = "wifi" | "beverage_package" | "soda_package" | "specialty_dining" | "travel_protection" | "transfers";
type GroupProfile = { title: string; organizationName: string; groupKey: string; groupTerms: string | null; roomStrategy: string | null; bookingWindow: string | null };
type CruiseExperience = { cruiseLine: string; shipName: string; embarkPort: string; sailingSummary: string; heroImageUrl: string | null; heroImageAlt: string | null; itineraryJson: string | null; roomGuidance: string | null; shipFactsJson?: string | null; amenitiesJson?: string | null };

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

function parseItinerary(raw?: string | null) {
  try {
    const parsed = raw ? JSON.parse(raw) : undefined;
    if (Array.isArray(parsed)) return parsed.map((entry) => [entry.day, entry.place, entry.detail] as [string, string, string]);
  } catch { /* Fall back to the approved itinerary below. */ }
  return itinerary;
}
function parseList(raw?: string | null, fallback: string[] = []) { try { const parsed = raw ? JSON.parse(raw) : undefined; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : fallback; } catch { return fallback; } }
function parseFacts(raw?: string | null) { try { const parsed = raw ? JSON.parse(raw) : undefined; return Array.isArray(parsed) ? parsed.filter((item): item is { label: string; value: string } => typeof item?.label === "string" && typeof item?.value === "string") : []; } catch { return []; } }

export function SchoolCruiseContent({ privateToken, profile, experience }: { privateToken?: string; profile?: GroupProfile; experience?: CruiseExperience }) {
  const [contact, setContact] = useState<Contact>(blankContact);
  const [rooms, setRooms] = useState<Room[]>([blankRoom()]);
  const [amenities, setAmenities] = useState<AmenityValue[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const cabinRequest = trpc.groupCruises.createCabinRequest.useMutation({
    onSuccess: () => { setSubmitted(true); setContact(blankContact()); setRooms([blankRoom()]); setAmenities([]); },
  });
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
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    await cabinRequest.mutateAsync({
      groupKey: "grimsley-hs-graduation-cruise-2027",
      privateToken,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
      amenities,
      consent: true,
      rooms: rooms.map((room) => ({
        ...room,
        travelers: room.travelers.map((traveler) => ({ ...traveler, age: Number(traveler.age) })),
      })),
    });
  };

  return <SiteShell>
    <section className="school-hero">
      <img src={shipImage} alt={shipImageAlt} />
      <div className="school-hero__veil" />
      <div className="page-wrap school-hero__content">
        <p className="eyebrow">{privateToken ? "Private family proposal" : groupName}</p>
        <h1 className="display">{groupTitle.replace(" 2027", "")} <em>2027.</em></h1>
        <p>{sailingSummary} · {embarkPort}</p>
        <div className="hero-actions"><a className="button-link button-link--ghost" href="#journey">See the journey <span aria-hidden="true">↓</span></a><a className="button-link" href="#request">Request your cabin <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>

    <section className="school-facts" aria-label="Cruise overview"><div className="page-wrap school-facts__grid">
      <div><span>Cruise line</span><strong>{experience?.cruiseLine || "Carnival Cruise Line"}</strong></div><div><span>Ship</span><strong>{shipName}</strong></div><div><span>Length</span><strong>Four nights</strong></div><div><span>Two island days</span><strong>RelaxAway and Celebration Key</strong></div>
    </div></section>
    {shipFacts.length > 0 && <section className="page-section school-ship-facts"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Mardi Gras at a glance</p><h2 className="display display--medium">A ship worth getting to <em>know.</em></h2></div><p className="body-copy">The details below are reviewed planning information. Wendy confirms the current sailing and cabin availability before any reservation is made.</p></div><div className="school-facts__grid school-facts__grid--light">{shipFacts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}</div></div></section>}

    <section className="page-section" id="journey"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">The journey</p><h2 className="display display--medium">Five days made for <em>celebrating.</em></h2></div><p className="body-copy">A graduation getaway with room for friends, family time, ocean air, and the kind of memories that last long after the final bell.</p></div><div className="school-itinerary">{displayItinerary.map(([date, place, detail], index) => <article key={date}><span>Day {index + 1}</span><h3>{date}</h3><strong>{place}</strong><p>{detail}</p></article>)}</div></div></section>

    <section className="page-section page-section--ink"><div className="page-wrap school-experience"><div><p className="eyebrow">Aboard Mardi Gras</p><h2 className="display display--medium">Something for every kind of <em>celebration.</em></h2></div><div className="school-experience__list"><article><span>01</span><div><h3>Big ship energy</h3><p>WaterWorks, pools, SportSquare, mini golf, ropes course, live shows, comedy, music, and wide open deck time.</p></div></article><article><span>02</span><div><h3>Space for graduates and parents</h3><p>Teen programming is age specific, while adults can enjoy Serenity, dining, live entertainment, lounges, and time to unwind.</p></div></article><article><span>03</span><div><h3>Two days ashore</h3><p>Spend time at RelaxAway, Half Moon Cay and Celebration Key, with Wendy available to help your household plan the details.</p></div></article></div></div></section>

    <section className="page-section"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Cabin starting points</p><h2 className="display display--medium">The right room begins with the right <em>conversation.</em></h2></div><p className="body-copy">The approved starting interior rates below help your household begin planning. Wendy will confirm the live category, deck, exact ship placement, taxes, gratuities, and final total before a reservation is made.</p></div><div className="school-rate-grid"><article><span>Two travelers</span><strong>$689</strong><p>Starting interior rate per traveler</p></article><article><span>Three travelers</span><strong>$599</strong><p>Starting interior rate per traveler</p></article><article><span>Four travelers</span><strong>$519</strong><p>Starting interior rate per traveler</p></article></div><div className="school-cabin-note"><div><span>Cabin styles</span><p>Interior, Ocean View, Balcony, and Suite options are reviewed with Wendy based on your household and current availability.</p></div><div><span>Cabin placement</span><p>Share whether you prefer forward, mid ship, aft, or no preference. Wendy will confirm the specific deck and location with your live quote.</p></div><div><span>Booking guidance</span><p>A fifty dollar per traveler deposit applies to this group request. A cabin is not held until Wendy confirms availability and you approve the live quote.</p></div></div></div></section>

    <section className="page-section page-section--warm"><div className="page-wrap school-ready"><div><p className="eyebrow">How this works</p><h2 className="display display--medium">A clear request. A personal <em>follow up.</em></h2><p className="body-copy">{profile?.groupTerms || "Choose the rooms your household needs and share the traveler details Wendy needs to begin. Wendy will personally confirm the current cabin category, ship location, pricing, deposit, and availability before anything is booked."}</p></div><div className="school-ready__steps"><div><span>01</span><h3>Request your rooms</h3><p>{profile?.roomStrategy || "Tell Wendy how many travelers are in each cabin and your preferred cabin style."}</p></div><div><span>02</span><h3>Wendy verifies options</h3><p>She checks live availability, including whether a cabin is forward, mid ship, or aft.</p></div><div><span>03</span><h3>Book with confidence</h3><p>{profile?.bookingWindow || "Wendy reviews the live quote with you and completes the reservation only after your approval."}</p></div></div></div></section>

    <section className="page-section" id="request"><div className="page-wrap school-request-layout"><aside className="school-request-aside"><p className="eyebrow">Cabin request</p><h2 className="display display--small">Your household, thoughtfully <em>organized.</em></h2><p className="body-copy">This is a request for Wendy to review. It does not hold a cabin or create a reservation.</p><div className="school-request-aside__summary"><span>{rooms.length} {rooms.length === 1 ? "room" : "rooms"}</span><span>{travelerCount} {travelerCount === 1 ? "traveler" : "travelers"}</span></div><a href="https://www.carnival.com/cruise-ships/mardi-gras" target="_blank" rel="noreferrer" className="button-link button-link--ink">Explore Mardi Gras <span aria-hidden="true">↗</span></a></aside>
      <form className="school-request-form" onSubmit={submit}>
        <div className="form-intro"><h2>Request your cabin</h2><p>Fields marked with an asterisk are required. Please enter traveler names exactly as they appear on travel documents.</p></div>
        <div className="form-grid"><div className="form-field"><label htmlFor="schoolFirstName">Primary contact first name *</label><input id="schoolFirstName" required value={contact.firstName} onChange={(event) => updateContact("firstName", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolLastName">Primary contact last name *</label><input id="schoolLastName" required value={contact.lastName} onChange={(event) => updateContact("lastName", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolEmail">Email *</label><input id="schoolEmail" type="email" required value={contact.email} onChange={(event) => updateContact("email", event.target.value)} /></div><div className="form-field"><label htmlFor="schoolPhone">Phone *</label><input id="schoolPhone" type="tel" required value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} /></div></div>
        <div className="school-rooms">{rooms.map((room, roomIndex) => <fieldset className="school-room" key={roomIndex}><legend>Room {roomIndex + 1}</legend><div className="form-grid"><div className="form-field"><label htmlFor={`room-${roomIndex}-occupancy`}>Travelers in this room *</label><select id={`room-${roomIndex}-occupancy`} value={room.occupancy} onChange={(event) => updateRoom(roomIndex, "occupancy", Number(event.target.value))}><option value={2}>2 travelers</option><option value={3}>3 travelers</option><option value={4}>4 travelers</option></select></div><div className="form-field"><label htmlFor={`room-${roomIndex}-type`}>Cabin style *</label><select id={`room-${roomIndex}-type`} value={room.roomType} onChange={(event) => updateRoom(roomIndex, "roomType", event.target.value as Room["roomType"])}>{Object.entries(roomLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="form-field form-field--wide"><label htmlFor={`room-${roomIndex}-location`}>Preferred ship location *</label><select id={`room-${roomIndex}-location`} value={room.locationPreference} onChange={(event) => updateRoom(roomIndex, "locationPreference", event.target.value as Room["locationPreference"])}>{Object.entries(locationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="form-help">Wendy will confirm the exact deck and forward, mid ship, or aft placement with the live quote.</span></div></div>
          <div className="school-travelers">{room.travelers.map((traveler, travelerIndex) => <div className="school-traveler" key={travelerIndex}><p>Traveler {travelerIndex + 1}</p><div className="form-grid"><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-first`}>Legal first name *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-first`} required value={traveler.firstName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "firstName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-middle`}>Middle name</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-middle`} value={traveler.middleName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "middleName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-last`}>Legal last name *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-last`} required value={traveler.lastName} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "lastName", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-age`}>Age at sailing *</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-age`} type="number" min="0" max="120" required value={traveler.age} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "age", event.target.value)} /></div><div className="form-field"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-birth`}>Date of birth</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-birth`} type="date" value={traveler.dateOfBirth} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "dateOfBirth", event.target.value)} /></div><div className="form-field form-field--wide"><label htmlFor={`room-${roomIndex}-traveler-${travelerIndex}-loyalty`}>Carnival VIFP number</label><input id={`room-${roomIndex}-traveler-${travelerIndex}-loyalty`} value={traveler.loyaltyNumber} onChange={(event) => updateTraveler(roomIndex, travelerIndex, "loyaltyNumber", event.target.value)} /></div></div></div>)}</div>
          {rooms.length > 1 && <button type="button" className="school-room__remove" onClick={() => setRooms((current) => current.filter((_, index) => index !== roomIndex))}>Remove this room</button>}
        </fieldset>)}</div>
        <button type="button" className="school-add-room" onClick={() => setRooms((current) => [...current, blankRoom()])} disabled={rooms.length >= 12}>Add another room <span aria-hidden="true">+</span></button>
        <fieldset className="school-amenities"><legend>Optional preferences</legend><p className="form-help">Tell Wendy what your household may be interested in. These are requests only and are not included or confirmed until Wendy reviews the live quote.</p><div>{amenityChoices.map((amenity) => { const value = amenity.toLowerCase().replaceAll(" ", "_") as AmenityValue; const accepted = ["wifi", "beverage_package", "soda_package", "specialty_dining", "travel_protection", "transfers"] as AmenityValue[]; if (!accepted.includes(value)) return null; const checked = amenities.includes(value); return <label key={value}><input type="checkbox" checked={checked} onChange={() => setAmenities((current) => checked ? current.filter((item) => item !== value) : [...current, value])} /> {amenity}</label>; })}</div></fieldset>
        <div className="form-field school-notes"><label htmlFor="schoolNotes">Anything Wendy should know?</label><textarea id="schoolNotes" placeholder="Share rooming preferences, celebration notes, accessibility requests, or other non sensitive planning details." value={contact.notes} onChange={(event) => updateContact("notes", event.target.value)} /></div>
        <label className="school-consent"><input type="checkbox" checked={contact.consent} required onChange={(event) => updateContact("consent", event.target.checked)} /><span>I agree that Wendy may contact me about this cabin request. I understand that this request does not hold a cabin or create a reservation.</span></label>
        <p className="form-help">Do not enter passport numbers, payment card details, account passwords, or medical information. Read the <a href="/privacy">privacy policy</a> for details.</p>
        <button className="button-submit" type="submit" disabled={cabinRequest.isPending}>{cabinRequest.isPending ? "Sending your request…" : "Send cabin request"} <span aria-hidden="true">↗</span></button>
        {submitted && <p className="form-success" role="status">Your cabin request is with Wendy. She will review the room details and contact you with the next steps.</p>}
        {cabinRequest.error && <p className="form-error" role="alert">Something interrupted your request. Please try again or email info@thewendycollective.com.</p>}
      </form>
    </div></section>
  </SiteShell>;
}

export default function SchoolCruise() {
  return <SchoolCruiseContent />;
}
