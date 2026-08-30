export type HeadMeta = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogUrlPath?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  noindex?: boolean;
  notFound?: boolean;
};

const SITE = "The Wendy Collective";
const DEFAULT_DESCRIPTION = "The Wendy Collective creates thoughtfully planned journeys, elevated escapes, and effortless travel moments.";
const SOCIAL_IMAGE = "/manus-storage/twc-social-preview_a42ef867.jpg";
const SOCIAL_ALT = "Cinematic travel clouds at sunrise for The Wendy Collective";
const GRIMSLEY_SOCIAL_IMAGE = "/manus-storage/mardi-gras-approved_10fa6e55.png";
const GRIMSLEY_SOCIAL_ALT = "Carnival Mardi Gras at sea near Port Canaveral";

const publicRoutes: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/": { title: "The Wendy Collective | Thoughtfully Planned Travel", description: DEFAULT_DESCRIPTION },
  "/about": { title: "About Wendy | The Wendy Collective", description: "Meet Wendy, the personal travel advisor behind The Wendy Collective and its thoughtful travel planning approach." },
  "/destinations": { title: "Curated Travel Destinations | The Wendy Collective", description: "Explore curated Caribbean, Mexico, all inclusive, group travel, and cruise inspiration with The Wendy Collective." },
  "/destinations/caribbean": { title: "Caribbean Travel Planning | The Wendy Collective", description: "Explore a Caribbean escape planned around your preferred pace, place, and reason for getting away." },
  "/destinations/mexico": { title: "Mexico Travel Planning | The Wendy Collective", description: "Discover a Mexico journey shaped around coastal calm, culture, and the experiences that matter to you." },
  "/destinations/all-inclusive": { title: "All Inclusive Escapes | The Wendy Collective", description: "Find an all inclusive escape that fits your travel rhythm, favorite setting, and time away together." },
  "/destinations/groups": { title: "Group Travel Planning | The Wendy Collective", description: "Plan group travel, celebrations, and shared escapes with thoughtful coordination from Wendy." },
  "/destinations/cruises": { title: "Cruise Travel Planning | The Wendy Collective", description: "Find a cruise and coastal journey with the right ship, itinerary, and time ashore for your group." },
  "/faq": { title: "Travel Planning FAQ | The Wendy Collective", description: "Answers to common travel planning questions about Wendy’s services, timing, group travel, insurance, and more." },
  "/contact": { title: "Plan Your Journey | The Wendy Collective", description: "Share your travel vision with Wendy and begin a thoughtfully planned journey made around you." },
  "/privacy": { title: "Privacy Policy | The Wendy Collective", description: "Learn how The Wendy Collective handles the information you share when beginning a travel conversation." },
  "/experiences/grimsley-hs-graduation-cruise-2027": { title: "Grimsley High School Graduation Cruise 2027 | The Wendy Collective", description: "Explore the Class of 2027 Carnival Mardi Gras graduation cruise and request a cabin with personal support from Wendy.", noindex: true },
};

export function prefetchForPath(url: string): HeadMeta {
  const rawPath = url.split("?")[0];
  let path = rawPath;
  try { path = decodeURI(rawPath); } catch { /* route will be treated as unknown */ }
  const clean = path.replace(/\/+$/, "") || "/";
  const route = publicRoutes[clean];
  if (route) return { ...route, canonicalPath: clean, ogImage: SOCIAL_IMAGE, ogImageAlt: SOCIAL_ALT };
  if (clean.startsWith("/group/")) return { title: `Grimsley Graduation Cruise 2027 | ${SITE}`, description: "A private request page for the Grimsley High School Graduation Cruise aboard Carnival Mardi Gras.", ogUrlPath: clean, ogImage: GRIMSLEY_SOCIAL_IMAGE, ogImageAlt: GRIMSLEY_SOCIAL_ALT, ogImageWidth: 695, ogImageHeight: 422, noindex: true };
  if (clean.startsWith("/family/")) return { title: `Your Grimsley Cruise Request | ${SITE}`, description: "Review or update your request for the Grimsley High School Graduation Cruise aboard Carnival Mardi Gras.", ogUrlPath: clean, ogImage: GRIMSLEY_SOCIAL_IMAGE, ogImageAlt: GRIMSLEY_SOCIAL_ALT, ogImageWidth: 695, ogImageHeight: 422, noindex: true };
  if (clean.startsWith("/proposal/")) return { title: `Private Proposal | ${SITE}`, description: "A private travel proposal from The Wendy Collective.", ogUrlPath: clean, noindex: true };
  if (clean === "/wendy") return { title: `Wendy Workspace | ${SITE}`, description: "Protected trip brief workspace for The Wendy Collective.", noindex: true };
  return { title: `${SITE} | Page Not Found`, description: DEFAULT_DESCRIPTION, notFound: true };
}
