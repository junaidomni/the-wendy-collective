import PreCruiseStay, {hotelAdvice} from "@/components/PreCruiseStay";
import { Link } from "wouter";
import { ArrowUpRight, CalendarDays, Ship, Mountain, Compass } from "lucide-react";
import ApprovedOfferArt from "@/components/ApprovedOfferArt";
import SiteShell from "@/components/SiteShell";
import { offerInquiryHref } from "@/lib/cruiseOffers";
import "./AlaskaOffer.css";

// Wendy-supplied supplier itinerary, September 28, 2026: BR2707087NKSEV.
// Seattle return verified on https://virg.in/4ABAfvp, September 28, 2026.
const alaskaItinerary = [
 ["July 8", "Seattle, Washington", "Depart 5:00 PM"],
 ["July 9", "At sea", "Time to enjoy the ship"],
 ["July 10", "Ketchikan, Alaska", "9:00 AM–5:00 PM"],
 ["July 11", "Sitka, Alaska", "9:00 AM–5:00 PM"],
 ["July 12", "Endicott Arm & Dawes Glacier", "Scenic cruising"],
 ["July 13", "At sea", "Time to enjoy the ship"],
 ["July 14", "Victoria, British Columbia", "10:00 AM–6:00 PM"],
 ["July 15", "Seattle, Washington", "Arrive 7:00 AM"],
];
const inquiry = offerInquiryHref("alaska-virgin-2027");
// Cabin imagery and supplier descriptions supplied by Wendy, October 2, 2026. No displayed rates.
const cabins = [
  {
    "name": "The Insider",
    "label": "Your interior retreat",
    "copy": "For duos looking to make the ship their sanctuary, this space features intuitive mood lighting, and the ultimate black-out sleep.",
    "features": [
      "Roomy rainshower",
      "Mood lighting",
      "Glam station",
      "Large flat screen TV"
    ],
    "image": "insider.avif",
    "caption": "The Insider · representative Virgin Voyages photo",
    "detail": "Wendy will confirm your cabin layout and availability.",
    "code": "insider",
    "gallery": [
      {
        "image": "insider-layout.png",
        "caption": "The Insider · bedroom"
      },
      {
        "image": "insider-evening.png",
        "caption": "The Insider · mood lighting"
      },
      {
        "image": "standard-bathroom.png",
        "caption": "Bathroom shared by Insider, Sea View, Sea Terrace and Central Sea Terrace categories"
      }
    ]
  },
  {
    "name": "The Sea View",
    "label": "Sea-to-sky sights",
    "copy": "With an innovative seabed, mood lighting, and large porthole window, go from chic to (very) deep sleep all voyage long.",
    "features": [
      "Porthole window for ocean views",
      "Nautical-style window seat",
      "Roomy rainshower",
      "Mood lighting",
      "Transformative seabed"
    ],
    "image": "sea-view.png",
    "caption": "Sea View · representative Virgin Voyages photo",
    "detail": "Wendy will confirm the layout, occupancy, and availability of your selected cabin.",
    "code": "sea-view",
    "gallery": [
      {
        "image": "sea-view-layout.png",
        "caption": "Sea View · alternate room layout"
      },
      {
        "image": "sea-view-window.png",
        "caption": "Sea View · porthole window seat"
      },
      {
        "image": "sea-view-evening.png",
        "caption": "Sea View · evening mood lighting"
      },
      {
        "image": "standard-bathroom.png",
        "caption": "Bathroom shared by Insider, Sea View, Sea Terrace and Central Sea Terrace categories"
      }
    ]
  },
  {
    "name": "The Sea Terrace",
    "label": "Your own outdoor space",
    "copy": "Morning sea air, an afternoon on your balcony, and a cozy retreat after exploring Alaska. Your Sea Terrace brings the outdoors a little closer, with a seabed that transforms from sleep to lounge time.",
    "features": [
      "Private balcony — glass or metal",
      "Terrace hammock (most, but not all)",
      "Roomy rainshower",
      "Mood lighting",
      "Transformative seabed",
      "Glam station"
    ],
    "image": "sea-terrace.avif",
    "caption": "Sea Terrace · representative Virgin Voyages photo",
    "detail": "Forward or aft located Sea Terraces. Wendy will confirm the features of your selected cabin.",
    "code": "sea-terrace",
    "gallery": [
      {
        "image": "terrace-sofa.png",
        "caption": "Sea Terrace · seabed in sofa configuration"
      },
      {
        "image": "terrace-glam.png",
        "caption": "Glam station · available in all Sea Terrace categories"
      },
      {
        "image": "terrace-evening.png",
        "caption": "Sea Terrace · mood lighting"
      },
      {
        "image": "terrace-bunks.png",
        "caption": "Sea Terrace · example multi-sailor layout"
      },
      {
        "image": "terrace-twin-bunks.png",
        "caption": "Sea Terrace · example separate-bed layout"
      },
      {
        "image": "standard-bathroom.png",
        "caption": "Bathroom shared by Insider, Sea View, Sea Terrace and Central Sea Terrace categories"
      }
    ]
  },
  {
    "name": "Central Sea Terrace",
    "label": "Location, location, relaxation",
    "copy": "Make the middle of the ship your home at sea. Enjoy the Sea Terrace experience in a central location, with your own balcony for slow mornings and ocean views between adventures. Wendy can help you compare cabin locations around the places you plan to enjoy most.",
    "features": [
      "Sea Terrace amenities in a central location",
      "Roomy rainshower",
      "Mood lighting",
      "Transformative seabed",
      "Glam station"
    ],
    "image": "sea-terrace.avif",
    "caption": "Representative Sea Terrace photo; not a specific Central Sea Terrace cabin",
    "detail": "Hammocks are available in most, but not all, Sea Terraces. Wendy will confirm your cabin location and features.",
    "code": "central-sea-terrace",
    "gallery": [
      {
        "image": "terrace-sofa.png",
        "caption": "Sea Terrace · seabed in sofa configuration"
      },
      {
        "image": "terrace-glam.png",
        "caption": "Glam station · available in all Sea Terrace categories"
      },
      {
        "image": "terrace-evening.png",
        "caption": "Sea Terrace · mood lighting"
      },
      {
        "image": "terrace-bunks.png",
        "caption": "Sea Terrace · example multi-sailor layout"
      },
      {
        "image": "terrace-twin-bunks.png",
        "caption": "Sea Terrace · example separate-bed layout"
      },
      {
        "image": "standard-bathroom.png",
        "caption": "Bathroom shared by Insider, Sea View, Sea Terrace and Central Sea Terrace categories"
      }
    ]
  },
  {
    "name": "XL Sea Terrace",
    "label": "More room to unwind",
    "copy": "Stretch out after a day of Alaskan adventures. The XL Sea Terrace gives you extra living space and a larger bathroom, with a separate shower and water closet for a little more privacy when getting ready.",
    "features": [
      "Extra living space",
      "Private balcony",
      "Larger bathroom with separate shower and water closet",
      "Glam station",
      "Mood lighting"
    ],
    "image": "xl-terrace.png",
    "caption": "XL Sea Terrace · representative Virgin Voyages photo",
    "detail": "Wendy will confirm your cabin location, layout and balcony features.",
    "code": "xl-sea-terrace",
    "gallery": [
      {
        "image": "xl-twin.png",
        "caption": "XL Sea Terrace · separate-bed layout"
      },
      {
        "image": "xl-storage.png",
        "caption": "XL Sea Terrace · wardrobe and storage"
      },
      {
        "image": "terrace-glam.png",
        "caption": "Glam station · available in all Sea Terrace categories"
      },
      {
        "image": "xl-bathroom.png",
        "caption": "XL bathroom · separate shower and water closet visible in the mirror"
      },
      {
        "image": "terrace-hammock.png",
        "caption": "XL Sea Terrace · balcony and hammock"
      }
    ]
  },
  {
    "name": "RockStar Quarters",
    "label": "Explore the suite experience",
    "copy": "Upgraded amenities, RockStar agent, exclusive access to Richard’s Rooftop (and much more) — suite dreams really are made of this.",
    "features": [
      "Exclusive Richard’s Rooftop access",
      "RockStar Agent",
      "Stocked & ready to rock in-room bar",
      "Early/Priority access booking",
      "Large luxurious shower"
    ],
    "image": "brilliant-suite.avif",
    "caption": "Brilliant Suite shown · one of the RockStar suite options",
    "detail": "Suite layouts and benefits vary. Wendy will explain the details for your selected suite.",
    "code": "rockstar",
    "gallery": [
      {
        "image": "rockstar-bedroom.png",
        "caption": "RockStar Quarters · bedroom example"
      },
      {
        "image": "rockstar-bar.png",
        "caption": "Brilliant Suite · in-room bar"
      },
      {
        "image": "rockstar-shower.png",
        "caption": "RockStar suite · rain shower example"
      },
      {
        "image": "rockstar-robe.png",
        "caption": "RockStar suite · bathrobe"
      },
      {
        "image": "rockstar-bathroom.png",
        "caption": "RockStar suite · bathroom example"
      }
    ]
  }
];
const photoBounds: Record<string, number[]> = {"insider-evening.png": [1025, 683], "insider-layout.png": [1027, 683], "rockstar-balcony.png": [1050, 699], "rockstar-bar.png": [1054, 699], "rockstar-bathroom.png": [1247, 701], "rockstar-bedroom.png": [1245, 700], "rockstar-hammock.png": [1045, 698], "rockstar-robe.png": [1245, 700], "rockstar-shower.png": [1139, 702], "sea-view-evening.png": [1054, 682], "sea-view-layout.png": [1028, 683], "sea-view-window.png": [1029, 686], "sea-view.png": [1027, 681], "standard-bathroom.png": [1091, 684], "terrace-bunks.png": [1027, 683], "terrace-evening.png": [1023, 682], "terrace-glam.png": [1026, 683], "terrace-hammock.png": [1022, 683], "terrace-sofa.png": [1114, 685], "terrace-twin-bunks.png": [1027, 683], "xl-bathroom.png": [1135, 703], "xl-storage.png": [1051, 700], "xl-terrace.png": [1141, 697], "xl-twin.png": [1114, 699]};
function CabinImage({image, caption}: {image: string; caption: string}) {
 const bounds = photoBounds[image];
 return <div className={bounds ? "alaska-photo-crop" : undefined} style={bounds ? {aspectRatio: `${bounds[0]} / ${bounds[1]}`} : undefined}><img src={`/images/offers/cabins/${image}`} alt={caption} loading="lazy"/></div>;
}
const questions = [
  ["Where does this cruise depart?", "The Brilliant Lady sailing is July 8–15, 2027 and departs from and returns to Seattle, Washington."],
  ["Can Wendy help with a hotel before the cruise?", hotelAdvice + " Hotel stays are arranged separately from your cruise fare."],
  ["Is this voyage adults-only?", "Yes. Virgin Voyages welcomes travelers ages 18 and over."],
  ["What is included in my fare?", "Virgin’s voyage experience includes dining, entertainment and group fitness classes. Wendy will explain the exact fare inclusions, optional extras and cancellation terms in your quote."],
  ["How can I get the full sailing itinerary?", "Wendy can help you review the latest route, departure details, and port times for your July 8–15, 2027 voyage, along with your plans before and after the cruise."],
  ["Can I use My Next Virgin Voyage or Future Voyage Credit?", "Tell Wendy which one you have before booking. These are different products, and eligibility and combinability must be checked for your reservation. You do not need your Virgin Voyages ID to begin an inquiry."],
  ["Are group benefits available with every cabin?", "Not automatically. Individual bookings and group cabins may have different benefits. Wendy will confirm the benefits that apply to your specific cabin and fare before you reserve."],
  ["Does an inquiry reserve my cabin?", "No. An inquiry starts the conversation. Wendy will confirm availability, pricing, deposit requirements and payment deadlines before you choose to book."],
];

export default function AlaskaOffer() {
  return <SiteShell darkHeader><div className="alaska-page">
    <div className="alaska-wrap alaska-breadcrumb"><Link href="/offers">← Current Offers</Link></div>
    <section className="alaska-hero alaska-wrap" aria-labelledby="alaska-title">
      <div className="alaska-art"><a href="#alaska-inquiry" aria-label="Explore the Experience Alaska inquiry options"><ApprovedOfferArt art="alaska" title="Experience Alaska"/></a></div>
      <div className="alaska-hero-copy"><p className="alaska-kicker">The Wendy Collective · Summer 2027</p><h1 id="alaska-title">Experience <em>Alaska.</em></h1><p className="alaska-lede">Wild beauty.<br />A different kind of voyage.</p><p>Glacier-blue water. Forested coastlines. Time to slow down and look a little longer. Discover Alaska aboard Virgin Voyages’ Brilliant Lady, with Wendy guiding the details.</p>
      <p className="alaska-roundtrip"><strong>Departing and returning to Seattle, Washington</strong></p><dl className="alaska-facts"><div><CalendarDays aria-hidden="true"/><dt>Dates</dt><dd>July 8–15, 2027</dd></div><div><Ship aria-hidden="true"/><dt>Your ship</dt><dd>Brilliant Lady</dd></div><div><Mountain aria-hidden="true"/><dt>The experience</dt><dd>7 nights · Alaska</dd></div><div><Compass aria-hidden="true"/><dt>Travel style</dt><dd>Adults-only · 18+</dd></div></dl>
      <a className="alaska-button" href="#alaska-cabins">Explore your cabin options <ArrowUpRight aria-hidden="true"/></a><p className="alaska-small">Personal planning with Wendy. Current pricing by inquiry.</p></div>
    </section>
    <nav className="alaska-section-nav" aria-label="Explore Experience Alaska"><div className="alaska-wrap"><a href="#alaska-journey">The journey</a><a href="#alaska-ship">See the ship</a><a href="#alaska-cabins">Staterooms</a><a href="#alaska-value">Current value</a><a href="#before-you-sail">Hotels before sailing</a><a href="#alaska-faq">Good to know</a></div></nav>
    <section id="alaska-journey" className="alaska-section alaska-wrap"><div className="alaska-heading"><p className="alaska-kicker">The journey</p><h2>Let the scenery <em>set the pace.</em></h2></div><div className="alaska-journey-grid"><div><p className="alaska-intro">Seven nights to discover the coast, enjoy life at sea, and make room for something extraordinary.</p><p>Wendy will help you connect the voyage with the details around it—from your arrival plans to the experiences you want ashore.</p><div className="alaska-confirm"><strong>Your sailing itinerary</strong><p>Discover your July 8–15, 2027 voyage with personal guidance from Wendy. Sail roundtrip from Seattle through Alaska’s Inside Passage and glacial fjords. Wendy can help plan your arrival and time ashore.</p><ol className="alaska-itinerary">{alaskaItinerary.map(([date,port,time])=><li key={date}><span>{date}</span><div><strong>{port}</strong><span>{time}</span></div></li>)}</ol><p className="alaska-small">Itinerary and port times are subject to change. Arrival time is not the same as disembarkation time; Wendy can help coordinate your return travel.</p><Link href={inquiry}>Plan this July 8–15 voyage with Wendy ↗</Link></div></div><figure className="alaska-photo"><img src="/images/offers/alaska-ship.jpg" alt="A Virgin Voyages ship sailing past forested coastlines" loading="lazy" width="2048" height="1365"/><figcaption>A new perspective on time away.</figcaption></figure></div></section>
    <section id="alaska-ship" className="alaska-ship-section"><div className="alaska-wrap alaska-section"><div className="alaska-heading"><p className="alaska-kicker">Life aboard</p><h2>Meet <em>Brilliant Lady.</em></h2><p>An adults-only setting with room for quiet mornings, memorable meals and lively evenings.</p></div><div className="alaska-three"><article><h3>A table for every mood</h3><p>Explore Virgin’s dining venues, including the Spanish-inspired Rojo by Razzle Dazzle aboard Brilliant Lady.</p></article><article><h3>Evenings with character</h3><p>Make time for live entertainment and shows, or find a favorite place to linger after dinner.</p></article><article><h3>Your own rhythm</h3><p>Balance days of exploring with group fitness, time to unwind and the simple pleasure of watching the coast go by.</p></article></div><Link className="alaska-source" href={inquiry}>Ask Wendy about Brilliant Lady ↗</Link></div></section>
    <section id="alaska-cabins" className="alaska-section alaska-wrap"><div className="alaska-heading"><p className="alaska-kicker">Your space at sea</p><h2>Choose how you <em>settle in.</em></h2><p>Start with the cabin that suits your style. Wendy will check availability and prepare a current quote.</p></div><aside className="alaska-rate-note"><strong>Ask Wendy about Lock It In rates</strong><p>Explore Lock It In fare options for The Insider, Sea View and Sea Terrace. Restrictions apply. Wendy will confirm availability, explain the terms and compare the benefits before you book.</p><p>The Sea Terrace Lock It In rate allows no changes or modifications, may have a limited view, and does not qualify for the additional $100 group bonus.</p><ul>{[["insider", "Insider"], ["sea-view", "Sea View"], ["sea-terrace", "Sea Terrace"]].map(([code, name]) => <li key={code}><Link href={`${inquiry}&cabin=${code}&rate=lock-it-in`}>Ask Wendy about {name} Lock It In ↗</Link></li>)}</ul></aside><div className="alaska-three alaska-cabins">{cabins.map(c=><article key={c.code}><figure className="alaska-cabin-photo"><CabinImage image={c.image} caption={c.caption}/><figcaption>{c.caption}</figcaption></figure><span className="alaska-cabin-label">{c.label}</span><h3>{c.name}</h3><p>{c.copy}</p><ul className="alaska-cabin-features">{c.features.map(feature=><li key={feature}>{feature}</li>)}</ul><p className="alaska-small">{c.detail}</p>{c.gallery.length > 0 && <details className="alaska-room-gallery"><summary>See more {c.name} photos</summary><p className="alaska-gallery-note">Representative images. Layouts and features vary by cabin or suite.</p>{c.gallery.map(photo=><figure key={photo.image}><CabinImage image={photo.image} caption={photo.caption}/><figcaption>{photo.caption}</figcaption></figure>)}</details>}<Link href={`${inquiry}&cabin=${c.code}`} className="alaska-text-link">Ask Wendy about {c.code === "rockstar" ? "suites" : "this cabin"} <ArrowUpRight aria-hidden="true"/></Link></article>)}</div></section>
    <section id="alaska-value" className="alaska-value-section"><div className="alaska-wrap alaska-section alaska-value-grid"><div><p className="alaska-kicker">Current offer, personal advice</p><h2>A thoughtful look at <em>your best fit.</em></h2></div><div><p>Wendy will compare the available fares, explain what each includes, and check whether any group or resident offers apply to your booking.</p><ul><li>Current cabin pricing and availability</li><li>Eligible group benefits and promotional offers</li><li>Fare flexibility, deposit and payment dates</li><li>MNVV and Future Voyage Credit eligibility</li></ul><p className="alaska-small">No group benefits or savings are guaranteed until confirmed in your quote. Offers can change and may not combine.</p><Link className="alaska-button" href={inquiry}>Request my current quote <ArrowUpRight aria-hidden="true"/></Link></div></div></section>
    <PreCruiseStay inquiry={inquiry}/>
    <section id="alaska-faq" className="alaska-section alaska-wrap alaska-faq"><div className="alaska-heading"><p className="alaska-kicker">Good to know</p><h2>A few details, <em>before you go.</em></h2></div><div>{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section id="alaska-inquiry" className="alaska-inquiry"><div className="alaska-wrap alaska-section"><p className="alaska-kicker">Your next chapter starts here</p><h2>Let’s make <em>Alaska yours.</em></h2><p>Choose your starting point. Wendy will take it from there.</p><div className="alaska-three"><Link href={inquiry}><span>Planning a new voyage</span><strong>Start my Alaska inquiry <ArrowUpRight aria-hidden="true"/></strong></Link><Link href={`${inquiry}&credit=mnvv`}><span>My Next Virgin Voyage</span><strong>I have an MNVV <ArrowUpRight aria-hidden="true"/></strong></Link><Link href={`${inquiry}&credit=fvc`}><span>Future Voyage Credit</span><strong>I have an FVC <ArrowUpRight aria-hidden="true"/></strong></Link></div><p className="alaska-small">Start a conversation with Wendy about your voyage. Your cabin and fare are confirmed when you book.</p><Link className="alaska-back" href="/offers">← Explore all current offers</Link></div></section>
  </div></SiteShell>;
}

