import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import { getDestinationGuide, guideInquiryHref } from "@/lib/destinationGuides";

function GuideNotFound() {
  return <SiteShell darkHeader><section className="page-hero"><div className="page-wrap"><p className="eyebrow">Destination collection</p><h1 className="display">This guide is still <em>taking shape.</em></h1><p className="body-copy">Wendy would be happy to talk through the kind of journey you have in mind.</p><Link href="/contact" className="button-link">Plan Your Journey <span aria-hidden="true">↗</span></Link></div></section></SiteShell>;
}

export default function DestinationGuide() {
  const slug = typeof window === "undefined" ? "caribbean" : window.location.pathname.split("/").filter(Boolean).pop() ?? "";
  const guide = getDestinationGuide(slug);
  if (!guide) return <GuideNotFound />;

  return <SiteShell darkHeader>
    <section className="guide-hero">
      <img className="guide-hero__image" src={guide.image} alt={guide.imageAlt} />
      <div className="guide-hero__veil" aria-hidden="true" />
      <div className="page-wrap guide-hero__content"><p className="eyebrow">{guide.number} / {guide.label}</p><h1 className="display">{guide.title} <em>{guide.italic}</em></h1><p>{guide.summary}</p><Link href={guideInquiryHref(guide)} className="button-link">{guide.inquiryLabel} <span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="page-section page-section--warm"><div className="page-wrap guide-intro"><p className="eyebrow">A starting point, made personal</p><div><h2 className="display display--small">The feeling is clear. <em>Now, let’s make it yours.</em></h2><p className="body-copy">These are the kinds of moments this collection can hold. Your trip will be shaped around the people going, the occasion, and the way you want the time to feel.</p></div></div></section>
    <section className="page-section"><div className="page-wrap guide-snapshot"><div><p className="eyebrow">Ideal for</p><h2 className="display display--small">A journey with the <em>right rhythm.</em></h2><div className="guide-list">{guide.idealFor.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}</div></div><div className="guide-moments"><p className="eyebrow">A few possibilities</p>{guide.moments.map((moment, index) => <article key={moment}><span>0{index + 1}</span><h3>{moment}</h3></article>)}</div></div></section>
    <section className="page-section page-section--ink"><div className="page-wrap guide-note"><p className="eyebrow">Wendy’s planning note</p><div><h2 className="display display--small">The difference is in the <em>fit.</em></h2><p className="body-copy body-copy--light">{guide.planningNote}</p><Link href={guideInquiryHref(guide)} className="button-link">{guide.inquiryLabel} <span aria-hidden="true">↗</span></Link></div></div></section>
    <section className="page-section"><div className="page-wrap"><div className="cta-panel"><p className="eyebrow" style={{ color: "#0d1c22" }}>A personal invitation</p><h2 className="display display--medium">Love this direction? <em>Let’s begin there.</em></h2><p>Tell Wendy what is calling you to this kind of journey. Your trip brief will begin with {guide.label} already selected, so you can focus on the details that make it personal.</p><Link href={guideInquiryHref(guide)} className="button-link button-link--ink">{guide.inquiryLabel} <span aria-hidden="true">↗</span></Link></div></div></section>
  </SiteShell>;
}
