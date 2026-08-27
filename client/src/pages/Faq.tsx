import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const faqs = [
  ["How much do your services cost?", "My services are completely free to you. I am compensated by travel suppliers, including cruise lines, hotels, and resorts, not by you. You get expert planning at zero cost."],
  ["How do you get paid if it’s free?", "Travel suppliers pay advisors a commission when bookings are made through us. This is built into the pricing they offer to everyone, so you are not paying extra. In many cases, I can actually get you better pricing and perks than booking directly."],
  ["What happens after I submit an inquiry?", "I will review your details and reach out within 1 to 2 business days to learn more about what you are looking for. From there, I will research options and put together a personalized proposal for you."],
  ["How far in advance should I book?", "The earlier, the better, especially for cruises, destination weddings, and peak travel seasons. That said, I can often work magic on shorter timelines too. Reach out and let’s see what is possible."],
  ["What destinations do you specialize in?", "I specialize in Caribbean cruises, Mexico including Riviera Maya, Cancún, and Los Cabos, Hawaii, European river cruises, Alaska, and all inclusive resorts worldwide. If you have another destination in mind, I am happy to help."],
  ["Do you handle travel insurance?", "Yes. I always recommend travel insurance and can help you find the right coverage for your trip. It is one of the most important parts of travel planning that many people overlook."],
  ["What if something goes wrong during my trip?", "That is one of the biggest advantages of working with a travel advisor. If anything goes sideways, such as a flight cancellation, a room issue, or an itinerary change, I am here to advocate for you and help resolve it. You are never on your own."],
  ["Can you book a trip I have already researched?", "Absolutely. If you have already done your research and know what you want, I can often get you the same trip with added perks, better pricing, or both. Send me the details and let’s talk."],
];

export default function Faq() {
  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">Frequently asked questions</p><h1 className="display">A little clarity before <em>you take off.</em></h1><p className="body-copy">Travel planning should feel open, informed, and easy to begin. Here are a few of the questions new clients often ask.</p></div></section>
    <section className="page-section"><div className="page-wrap faq-layout"><aside className="faq-intro"><p className="eyebrow">The details</p><h2 className="display display--small">No question is too <em>early.</em></h2><p className="body-copy">If you do not see what you are looking for, Wendy would be happy to talk it through.</p><Link href="/contact" className="button-link button-link--ink">Ask Wendy <span aria-hidden="true">↗</span></Link></aside><div className="faq-list">{faqs.map(([question, answer]) => <details key={question} open><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>
  </SiteShell>;
}
