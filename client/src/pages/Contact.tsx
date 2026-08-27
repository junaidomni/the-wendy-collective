import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import SiteShell from "@/components/SiteShell";
import { type TravelType } from "@/lib/destinationGuides";
import { trpc } from "@/lib/trpc";

type TripForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  travelType: TravelType;
  destinations: string;
  travelTiming: string;
  dateFlexibility: "exact" | "flexible" | "unsure";
  budget: string;
  groupSize: string;
  priorities: string;
};

const validTravelTypes: TravelType[] = ["caribbean", "mexico", "allInclusive", "groupTravel", "cruise", "custom"];
const baseForm: TripForm = { firstName: "", lastName: "", email: "", phone: "", travelType: "custom", destinations: "", travelTiming: "", dateFlexibility: "flexible", budget: "", groupSize: "2", priorities: "" };

export function readTripBriefPrefill(search: string) {
  const parameters = new URLSearchParams(search);
  const requestedType = parameters.get("type") as TravelType | null;
  const guideLabel = parameters.get("destination") ?? "";
  return {
    form: { ...baseForm, travelType: requestedType && validTravelTypes.includes(requestedType) ? requestedType : "custom", destinations: guideLabel },
    guideLabel,
  };
}

function prefillFromSearch() {
  return readTripBriefPrefill(typeof window === "undefined" ? "" : window.location.search);
}

export default function Contact() {
  const [location] = useLocation();
  const [prefill] = useState(prefillFromSearch);
  const [form, setForm] = useState<TripForm>(prefill.form);
  const [guideLabel, setGuideLabel] = useState(prefill.guideLabel);
  const [success, setSuccess] = useState(false);
  const inquiry = trpc.inquiries.create.useMutation({ onSuccess: () => { setSuccess(true); setForm(baseForm); setGuideLabel(""); } });
  const update = (field: keyof TripForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    const next = prefillFromSearch();
    setForm(next.form);
    setGuideLabel(next.guideLabel);
  }, [location]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    await inquiry.mutateAsync({ ...form, groupSize: Number(form.groupSize), destinations: form.destinations.split(",").map((value) => value.trim()).filter(Boolean) });
  };

  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">Plan your journey</p><h1 className="display">Tell Wendy what you are <em>imagining.</em></h1><p className="body-copy">A few thoughtful details are all it takes to begin. Share your travel vision, and Wendy will be in touch to talk through what comes next.</p></div></section>
    <section className="page-section page-section--warm"><div className="page-wrap inquiry-layout"><aside className="inquiry-aside"><p className="eyebrow">Your trip brief</p><h2 className="display display--small">Every great plan begins with a <em>good conversation.</em></h2><p className="body-copy">You do not need every answer yet. Let Wendy know what you are considering, and the planning can unfold from there.</p><div className="inquiry-details"><div><span>01</span><p>Share the place, occasion, or travel style that feels right to you.</p></div><div><span>02</span><p>Add your timing, group size, and helpful budget guidance.</p></div><div><span>03</span><p>Wendy receives your brief and follows up personally.</p></div></div><figure className="inquiry-portrait"><img src="/manus-storage/wendy-planning_46f31bc8.png" alt="Wendy preparing travel plans beside the water" /><figcaption><span>Your travel advisor</span><strong>Thoughtful planning starts here.</strong></figcaption></figure></aside><form className="trip-form" onSubmit={submit}><div className="form-intro"><h2>Begin your trip brief</h2><p>Fields marked with an asterisk are required.</p>{guideLabel && <p className="form-prefill" role="status">Starting point: <strong>{guideLabel}</strong>. We have selected this for you below.</p>}</div><div className="form-grid"><div className="form-field"><label htmlFor="firstName">First name *</label><input id="firstName" required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></div><div className="form-field"><label htmlFor="lastName">Last name *</label><input id="lastName" required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></div><div className="form-field"><label htmlFor="email">Email *</label><input id="email" type="email" required value={form.email} onChange={(event) => update("email", event.target.value)} /></div><div className="form-field"><label htmlFor="phone">Phone *</label><input id="phone" type="tel" required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></div><div className="form-field"><label htmlFor="travelType">What are you planning? *</label><select id="travelType" value={form.travelType} onChange={(event) => update("travelType", event.target.value)}><option value="custom">A custom itinerary</option><option value="caribbean">A Caribbean escape</option><option value="mexico">A Mexico stay</option><option value="allInclusive">An all inclusive escape</option><option value="groupTravel">Group travel</option><option value="cruise">A cruise</option></select></div><div className="form-field"><label htmlFor="groupSize">Travelers *</label><input id="groupSize" type="number" min="1" max="100" required value={form.groupSize} onChange={(event) => update("groupSize", event.target.value)} /></div><div className="form-field form-field--wide"><label htmlFor="destinations">Destination interests *</label><input id="destinations" required placeholder="e.g., Jamaica, Riviera Maya, or an island cruise" value={form.destinations} onChange={(event) => update("destinations", event.target.value)} /><span className="form-help">Separate multiple ideas with commas.</span></div><div className="form-field"><label htmlFor="travelTiming">When would you like to travel? *</label><input id="travelTiming" required placeholder="e.g., October 2026" value={form.travelTiming} onChange={(event) => update("travelTiming", event.target.value)} /></div><div className="form-field"><label htmlFor="dateFlexibility">Date flexibility *</label><select id="dateFlexibility" value={form.dateFlexibility} onChange={(event) => update("dateFlexibility", event.target.value)}><option value="exact">My dates are set</option><option value="flexible">I am flexible</option><option value="unsure">I am still deciding</option></select></div><div className="form-field form-field--wide"><label htmlFor="budget">Comfortable budget range *</label><input id="budget" required placeholder="A general range is perfect" value={form.budget} onChange={(event) => update("budget", event.target.value)} /></div><div className="form-field form-field--wide"><label htmlFor="priorities">What would make this trip special?</label><textarea id="priorities" placeholder="Tell Wendy about the occasion, the pace you enjoy, who is traveling, or the moments you want to make space for." value={form.priorities} onChange={(event) => update("priorities", event.target.value)} /></div></div><p className="form-help">By sending your brief, you agree that Wendy may contact you about your travel plans. Please avoid sharing passport, payment, or other sensitive information here.</p><button className="button-submit" type="submit" disabled={inquiry.isPending}>{inquiry.isPending ? "Sending your brief…" : "Send My Trip Brief"} <span aria-hidden="true">↗</span></button>{success && <p className="form-success" role="status">Your trip brief is with Wendy. She will follow up personally to continue the conversation.</p>}{inquiry.error && <p className="form-error" role="alert">Something interrupted your submission. Please try again or email info@thewendycollective.com.</p>}</form></div></section>
  </SiteShell>;
}
