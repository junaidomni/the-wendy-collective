import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import { destinationGuides } from "@/lib/destinationGuides";

const journalMoments = [
  { image: "/manus-storage/wendy-rome_0ee9b386.png", alt: "Wendy visiting Rome", label: "Rome", title: "Stay curious." },
  { image: "/manus-storage/wendy-santorini-evening_7a8cabeb.png", alt: "Wendy enjoying an evening in Santorini", label: "Santorini", title: "Make time for the view." },
  { image: "/manus-storage/wendy-planning_46f31bc8.png", alt: "Wendy planning travel beside a tropical setting", label: "The planning table", title: "Details, considered." },
];

export default function Destinations() {
  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">Destination collections</p><h1 className="display">Start with a feeling. <em>Find your place.</em></h1><p className="body-copy">Explore a few of the travel moods Wendy plans most often. Each collection is an invitation to imagine, not an off the shelf itinerary.</p></div></section>
    <section className="page-section page-section--warm"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">Explore the collections</p><h2 className="display display--medium">Browse a little. <em>Then make it yours.</em></h2></div><p className="body-copy">Find the place, pace, or travel style that feels closest to what you are imagining. When you are ready, Wendy will turn that direction into a considered plan.</p></div><div className="guide-grid">{destinationGuides.map((guide) => <Link href={`/destinations/${guide.slug}`} className="guide-card" key={guide.slug}><img src={guide.image} alt="" /><div className="guide-card__veil" /><div className="guide-card__copy"><p>{guide.number} / {guide.label}</p><h2>{guide.title} <em>{guide.italic}</em></h2><span>Explore the guide <b aria-hidden="true">↗</b></span></div></Link>)}</div><div className="wendy-journal"><div className="wendy-journal__heading"><p className="eyebrow">Wendy in the world</p><h2 className="display display--small">A planner with a <em>traveler’s point of view.</em></h2><p className="body-copy">Wendy brings the same curiosity to her own travels that she brings to every client journey: attention to the feeling of a place, the moments in between, and the details that turn a trip into a memory.</p></div><div className="journal-grid">{journalMoments.map((moment) => <figure className="journal-card" key={moment.label}><img src={moment.image} alt={moment.alt} /><figcaption><span>{moment.label}</span><strong>{moment.title}</strong></figcaption></figure>)}</div></div></div></section>
    <section className="page-section page-section--ink"><div className="page-wrap intro-grid"><p className="eyebrow">The personal part</p><div><h2 className="display display--small">A destination is only the beginning. <em>The details make it yours.</em></h2><p className="body-copy body-copy--light">Explore as much or as little as you like. When a place or travel style begins to feel right, Wendy will help shape it into a clear, connected plan.</p><Link href="/contact" className="button-link">Share your travel vision <span aria-hidden="true">↗</span></Link></div></div></section>
  </SiteShell>;
}
