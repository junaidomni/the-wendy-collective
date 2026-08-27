import { useEffect } from "react";

const SITE_URL = "https://wendytravel-g2nn4krv.manus.space";
const DEFAULT_TITLE = "The Wendy Collective | Thoughtfully Planned Travel";
const DEFAULT_DESCRIPTION = "The Wendy Collective creates thoughtfully planned journeys, elevated escapes, and effortless travel moments.";

type PageMetadata = { title: string; description: string; indexable: boolean };

const routeMetadata: Record<string, PageMetadata> = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, indexable: true },
  "/about": { title: "About Wendy | The Wendy Collective", description: "Meet Wendy, the personal travel advisor behind The Wendy Collective and its thoughtful travel planning approach.", indexable: true },
  "/destinations": { title: "Curated Travel Destinations | The Wendy Collective", description: "Explore curated Caribbean, Mexico, all inclusive, group travel, and cruise inspiration with The Wendy Collective.", indexable: true },
  "/faq": { title: "Travel Planning FAQ | The Wendy Collective", description: "Answers to common travel planning questions about Wendy’s services, timing, group travel, insurance, and more.", indexable: true },
  "/contact": { title: "Plan Your Journey | The Wendy Collective", description: "Share your travel vision with Wendy and begin a thoughtfully planned journey made around you.", indexable: true },
  "/privacy": { title: "Privacy Policy | The Wendy Collective", description: "Learn how The Wendy Collective handles the information you share when beginning a travel conversation.", indexable: true },
  "/wendy": { title: "Wendy Workspace | The Wendy Collective", description: "Protected trip brief workspace for The Wendy Collective.", indexable: false },
};

const guideMetadata: Record<string, PageMetadata> = {
  "/destinations/caribbean": { title: "Caribbean Travel Planning | The Wendy Collective", description: "Explore a Caribbean escape planned around your preferred pace, place, and reason for getting away.", indexable: true },
  "/destinations/mexico": { title: "Mexico Travel Planning | The Wendy Collective", description: "Discover a Mexico journey shaped around coastal calm, culture, and the experiences that matter to you.", indexable: true },
  "/destinations/all-inclusive": { title: "All Inclusive Escapes | The Wendy Collective", description: "Find an all inclusive escape that fits your travel rhythm, favorite setting, and time away together.", indexable: true },
  "/destinations/groups": { title: "Group Travel Planning | The Wendy Collective", description: "Plan group travel, celebrations, and shared escapes with thoughtful coordination from Wendy.", indexable: true },
  "/destinations/cruises": { title: "Cruise Travel Planning | The Wendy Collective", description: "Find a cruise and coastal journey with the right ship, itinerary, and time ashore for your group.", indexable: true },
};

export function metadataForPath(path: string): PageMetadata {
  return routeMetadata[path] ?? guideMetadata[path] ?? { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, indexable: false };
}

function setMeta(selector: string, attribute: "name" | "property", content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, selector.match(/=["']?([^"'\]]+)/)?.[1] ?? ""); document.head.appendChild(element); }
  element.content = content;
}

export function usePageMetadata(path: string) {
  useEffect(() => {
    const metadata = metadataForPath(path);
    const canonical = `${SITE_URL}${path === "/" ? "/" : path}`;
    document.title = metadata.title;
    setMeta('meta[name="description"]', "name", metadata.description);
    setMeta('meta[name="robots"]', "name", metadata.indexable ? "index, follow" : "noindex, nofollow");
    setMeta('meta[property="og:title"]', "property", metadata.title);
    setMeta('meta[property="og:description"]', "property", metadata.description);
    setMeta('meta[property="og:url"]', "property", canonical);
    setMeta('meta[name="twitter:title"]', "name", metadata.title);
    setMeta('meta[name="twitter:description"]', "name", metadata.description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
  }, [path]);
}
