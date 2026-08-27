import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const travelStyles = [
  { number: "01", title: "Caribbean", meta: "Salt air, still water, unhurried days", image: "/manus-storage/twc-caribbean_1a3e0036.jpg", href: "/destinations/caribbean" },
  { number: "02", title: "Mexico", meta: "Culture, coastlines, and exquisite stays", image: "/manus-storage/twc-mexico_b427d449.jpg", href: "/destinations/mexico" },
  { number: "03", title: "At Sea", meta: "Space to gather, time to explore", image: "/manus-storage/twc-hero-travel-film_89224a2a.jpg", href: "/destinations/cruises" },
];

const services = [
  ["01", "All-Inclusive Escapes", "A resort experience shaped around your preferred rhythm, setting, and level of ease.", "/destinations/all-inclusive"],
  ["02", "Group Journeys", "Clear coordination for milestone trips, multigenerational time together, and shared celebrations.", "/destinations/groups"],
  ["03", "Cruises & Coastlines", "Sailings selected with care, plus the stay and shore moments that make the journey feel complete.", "/destinations/cruises"],
  ["04", "Custom Itineraries", "Thoughtful stays, transitions, and experiences connected into one seamless trip.", "/contact?type=custom"],
];

const whyChoose = [
  ["01", "Clear, honest guidance", "Every option is explained with the insight and context to help you choose confidently."],
  ["02", "Thoughtful recommendations", "Your plans begin with what matters to you, not with a one-size-fits-all itinerary."],
  ["03", "A real person to call", "When questions arise or plans shift, you have one trusted advisor in your corner."],
  ["04", "Details handled with care", "From the early ideas to the travel days ahead, the moving pieces stay organized."],
];

export default function Home() {
  return (
    <SiteShell>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-fallback" aria-hidden="true" />
        <video className="hero-video" autoPlay muted loop playsInline poster="/manus-storage/twc-hero-travel-film_89224a2a.jpg" aria-hidden="true">
          <source src="/manus-storage/twc-hero-loop-extended_39a9a78a.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow reveal">Thoughtful travel, personally planned</p>
            <h1 id="hero-title" className="hero-title reveal reveal--delay">Let’s plan a journey<br /><em>worth remembering.</em></h1>
            <p className="hero-description reveal reveal--delay-2">Beautiful places, memorable stays, local flavor, and every detail in between—planned around the way you want to travel.</p>
            <div className="hero-actions reveal reveal--delay-2">
              <Link href="/contact" className="button-link">Plan Your Journey <span aria-hidden="true">↗</span></Link>
              <Link href="/destinations" className="button-link button-link--ghost">Explore Destinations</Link>
            </div>
          </div>
        </div>
        <span className="hero-scroll" aria-hidden="true">Scroll to explore</span>
      </section>

      <section className="page-section">
        <div className="page-wrap intro-grid">
          <div className="wendy-way-aside"><p className="eyebrow">The Wendy way</p><img src="/manus-storage/wendy-city_77f5e3e7.png" alt="Wendy, your personal travel advisor" /><p>Meet Wendy, your personal travel advisor.</p></div>
          <div>
            <h2 className="display display--medium">Travel should feel <em>like you</em> from the very first conversation.</h2>
            <p className="body-copy">The Wendy Collective is a personal travel advisory for people who value both beautiful experiences and a calm, well-considered plan. Share the feeling you are after; Wendy will help shape the details that make it real.</p>
            <div className="lead-mark"><span>“</span><p>Every journey starts with your priorities—the pace, the people, the reason to go, and the moments you do not want to miss.</p></div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div className="marquee-track"><span>Group Cruises</span><span>All-Inclusive Resorts</span><span>Destination Celebrations</span><span>Honeymoons</span><span>Family Time</span><span>Custom Itineraries</span><span>Group Cruises</span><span>All-Inclusive Resorts</span><span>Destination Celebrations</span><span>Honeymoons</span><span>Family Time</span><span>Custom Itineraries</span></div></div>

      <section className="page-section page-section--warm">
        <div className="page-wrap">
          <div className="section-heading">
            <div><p className="eyebrow">Destination inspiration</p><h2 className="display display--medium">Where would you <em>love to go?</em></h2></div>
            <p className="body-copy">Begin with a place, an occasion, or simply the desire for a different kind of week. The rest can take shape from there.</p>
          </div>
          <div className="experience-grid">
            {travelStyles.map((style) => <Link href={style.href} className="experience-card" key={style.title}><img className="experience-card__image" src={style.image} alt="" /><div className="experience-card__copy"><p className="experience-card__index">{style.number}</p><h3 className="experience-card__title">{style.title}</h3><p className="experience-card__meta">{style.meta} <span aria-hidden="true">↗</span></p></div></Link>)}
          </div>
        </div>
      </section>

      <section className="page-section page-section--ink">
        <div className="page-wrap">
          <div className="section-heading"><div><p className="eyebrow">What I offer</p><h2 className="display display--medium">A trip that feels <em>considered</em> at every turn.</h2></div><Link href="/contact" className="button-link button-link--ghost">Start a trip brief</Link></div>
          <div className="service-list">
            {services.map(([number, title, copy, href]) => <Link href={href} className="service-row" key={title}><span className="service-row__index">{number}</span><h3>{title}</h3><p>{copy}</p><span className="round-arrow" aria-hidden="true">↗</span></Link>)}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-wrap why-grid">
          <div className="why-visual"><img src="/manus-storage/wendy-city_77f5e3e7.png" alt="Wendy in the city, ready to help plan the next journey" /><div className="why-note">Planning that feels personal, never transactional.</div></div>
          <div><p className="eyebrow">Why choose Wendy</p><h2 className="display display--small">More than a booking. <em>A trusted point of view.</em></h2><p className="body-copy">Wendy listens closely, shares what she genuinely recommends, and approaches your travel plans with the care she would want for her own.</p><ol className="why-list">{whyChoose.map(([number, title, copy]) => <li key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div>
        </div>
      </section>

      <section className="page-section page-section--ink">
        <div className="page-wrap"><p className="eyebrow">The process</p><div className="section-heading"><h2 className="display display--medium">Easy to begin. <em>Beautifully managed.</em></h2></div><div className="process-grid"><article className="process-step"><span className="process-step__number">01 / Share</span><h3>Tell me what matters.</h3><p>Dates, ideas, budget, and the kind of time you want to have together.</p></article><article className="process-step"><span className="process-step__number">02 / Discover</span><h3>I research the details.</h3><p>Options are compared carefully and narrowed through your priorities.</p></article><article className="process-step"><span className="process-step__number">03 / Decide</span><h3>Choose with confidence.</h3><p>Talk through your favorites, then let each reservation fall into place.</p></article><article className="process-step"><span className="process-step__number">04 / Go</span><h3>Pack your bags.</h3><p>Travel with the clarity of a considered plan and a real person to call.</p></article></div></div>
      </section>

      <section className="page-section page-section--mist"><div className="page-wrap"><div className="story-placeholder"><div className="story-placeholder__copy"><p className="eyebrow">Client stories</p><h2 className="display display--small">The best stories begin <em>after you arrive.</em></h2><p className="body-copy body-copy--light">This space is reserved for Wendy’s approved client reflections—real stories of meaningful travel, shared when the time is right.</p></div><div className="story-placeholder__art" role="img" aria-label="A quiet Mexico coastal retreat" /></div></div></section>

      <section className="page-section"><div className="page-wrap"><div className="cta-panel"><p className="eyebrow" style={{ color: "#0d1c22" }}>A personal invitation</p><h2 className="display display--medium">Tell Wendy what you have been <em>imagining.</em></h2><p>Whether you know exactly where you are headed or simply know you are ready to go, a thoughtful first conversation is the best place to begin.</p><Link href="/contact" className="button-link button-link--ink">Plan My Trip <span aria-hidden="true">↗</span></Link></div></div></section>
    </SiteShell>
  );
}
