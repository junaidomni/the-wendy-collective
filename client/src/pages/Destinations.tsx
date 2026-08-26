import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const collections = [
  ["01", "All-Inclusive, Elevated", "Resorts selected for the way you actually want to spend your days—from slow mornings to lively evenings and everything in between."],
  ["02", "Together, Beautifully Planned", "Group travel that keeps rooms, timelines, and choices clear while leaving space for everyone to celebrate."],
  ["03", "Cruises With a Point of View", "Sailings considered in context, with the right ship, cabin, shore time, and pre- or post-stay details."],
];

export default function Destinations() {
  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">Destination collections</p><h1 className="display">Start with a feeling. <em>Find your place.</em></h1><p className="body-copy">These are not off-the-shelf itineraries. They are starting points for a journey that will be shaped around your people, your pace, and your reasons for going.</p></div></section>
    <section className="page-section page-section--warm"><div className="page-wrap"><div className="destination-grid"><article className="destination-feature"><img src="/manus-storage/twc-caribbean_1a3e0036.jpg" alt="Turquoise Caribbean cove" /><div className="destination-feature__copy"><p className="eyebrow">01 / Caribbean</p><h2>Caribbean, at your own pace.</h2><p>From tucked-away beaches to a villa-style escape or a lively island stay, find the water, warmth, and rhythm that fits your version of a reset.</p><Link href="/contact" className="button-link button-link--ghost">Design this escape</Link></div></article><div className="destination-side"><article className="destination-mini destination-mini--mexico"><p className="eyebrow">02 / Mexico</p><h3>Coast, culture, and calm.</h3><p>Choose a coast with a sense of place.</p></article><article className="destination-mini destination-mini--cruise"><p className="eyebrow">03 / Cruising</p><h3>See more. Settle in.</h3><p>Travel by sea with every detail considered.</p></article></div></div><div className="collection-grid">{collections.map(([number, title, copy]) => <article className="collection-card" key={title}><span className="collection-card__number">{number}</span><h3>{title}</h3><p>{copy}</p><Link href="/contact" className="button-link button-link--text">Inquire about this</Link></article>)}</div></div></section>
    <section className="page-section page-section--ink"><div className="page-wrap intro-grid"><p className="eyebrow">The personal part</p><div><h2 className="display display--small">A destination is only the beginning. <em>The details make it yours.</em></h2><p className="body-copy body-copy--light">Whether your ideas are fully formed or still taking shape, Wendy will help turn them into a clear, considered plan. Tell her what you are celebrating, who is coming, and the feeling you would like to return with.</p><Link href="/contact" className="button-link">Share your travel vision <span aria-hidden="true">↗</span></Link></div></div></section>
  </SiteShell>;
}
