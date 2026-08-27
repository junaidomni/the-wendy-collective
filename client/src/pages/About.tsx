import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const principles = [
  ["01", "Listen first", "The best travel plans begin with the people taking them: what they value, how they like to spend their time, and what the trip needs to make possible."],
  ["02", "Recommend thoughtfully", "Every suggestion should earn its place. The goal is a plan that feels exciting, clear, and genuinely suited to you."],
  ["03", "Handle the details", "A thoughtfully planned journey lets you stay present. From the first shortlist through travel day, the details deserve close attention."],
];

export default function About() {
  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">About Wendy</p><h1 className="display">A travel advisor with a <em>personal lens.</em></h1><p className="body-copy">The Wendy Collective exists to make meaningful travel feel easier to imagine, more rewarding to plan, and far more enjoyable to take.</p></div></section>
    <section className="page-section"><div className="page-wrap about-grid"><div className="about-photo"><img src="/manus-storage/wendy-santorini-day_c1438a3c.png" alt="Wendy enjoying the view in Santorini" /><p className="about-photo__caption">Thoughtful planning makes more room for the moments you traveled to have.</p></div><div><p className="eyebrow">The point of view</p><h2 className="display display--small">The best trip is not a template. It is a <em>reflection of you.</em></h2><p className="body-copy">Wendy’s approach begins with attention: the celebration behind the dates, the pace that feels right, the people around the table, and the experiences you want to carry home. From a relaxed all inclusive escape to a milestone group cruise, each journey is shaped around the way you want to feel when you arrive.</p><p className="body-copy">The Wendy Collective blends personal guidance with purposeful planning. You will always know what comes next, why a recommendation is being made, and who to call when you need a steady hand.</p><div className="principles">{principles.map(([number, title, copy]) => <article className="principle" key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></div></section>
    <section className="page-section page-section--warm"><div className="page-wrap advisor-value"><div className="advisor-value__aside"><p className="eyebrow">The value of an advisor</p><p>One trusted point of view, from the first idea to the journey ahead.</p><span aria-hidden="true">TWC</span></div><div><h2 className="display display--small">Less time sorting through options. <em>More time looking forward.</em></h2><p className="body-copy">Planning through The Wendy Collective means having a single, responsive point of contact to make sense of choices, coordinate moving parts, and put the finishing touches on your plans. The result is not just a reservation; it is the confidence to go well.</p><Link href="/contact" className="button-link button-link--ink">Start a conversation <span aria-hidden="true">↗</span></Link></div></div></section>
  </SiteShell>;
}
