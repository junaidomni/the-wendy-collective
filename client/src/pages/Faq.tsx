import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const faqs = [
  ["How does the planning process begin?", "Start by sharing a few details about the occasion, desired dates, travelers, priorities, and any ideas already on your mind. Wendy will use that conversation to understand what matters most before she starts researching."],
  ["How much do your planning services cost?", "The right planning approach depends on the trip and its complexity. Wendy will explain any applicable planning fees, supplier terms, and the value of the service clearly before you move forward."],
  ["Can you help if I do not know where I want to go?", "Absolutely. A great trip can begin with a feeling, a season, a celebration, or a travel style. Wendy can help you explore options that fit your preferred pace, budget guidance, and priorities."],
  ["Do you plan group travel and milestone celebrations?", "Yes. The Wendy Collective can help coordinate group cruises, resort stays, family trips, destination celebrations, and other journeys where logistics matter as much as the experience."],
  ["What kind of support can I expect once I travel?", "Your trip is planned with care before you leave, including the important details and next steps you need. If a question or unexpected change comes up, you will have a trusted human point of contact."],
  ["Can you help with all-inclusive resorts and cruises?", "Yes. Wendy will help compare the experience behind the category: the right atmosphere, cabin or room fit, included elements, group considerations, and the travel details around the stay or sailing."],
];

export default function Faq() {
  return <SiteShell darkHeader>
    <section className="page-hero"><div className="page-wrap"><p className="eyebrow">Frequently asked questions</p><h1 className="display">A little clarity before <em>you take off.</em></h1><p className="body-copy">Travel planning should feel open, informed, and easy to begin. Here are a few of the questions new clients often ask.</p></div></section>
    <section className="page-section"><div className="page-wrap faq-layout"><aside className="faq-intro"><p className="eyebrow">The details</p><h2 className="display display--small">No question is too <em>early.</em></h2><p className="body-copy">If you do not see what you are looking for, Wendy would be happy to talk it through.</p><Link href="/contact" className="button-link button-link--ink">Ask Wendy <span aria-hidden="true">↗</span></Link></aside><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>
  </SiteShell>;
}
