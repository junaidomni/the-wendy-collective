export type LegacyProposalArchiveItem = {
  id: string;
  title: string;
  client: string;
  occasion: string;
  travelWindow: string;
  route: string | null;
  hostedUrl: string | null;
  hosting: string;
  source: string;
  sourceStatus: string;
  reviewStatus: "source access needed" | "supplier refresh needed" | "content reconciliation needed" | "historical reference only";
  proposalMode: string;
  summary: string;
  knownDetails: string[];
  requiredBeforeSharing: string[];
  notes: string;
  sharePolicy: "not_shareable";
};

/** Internal, nonshareable index reconstructed from the uploaded Wendy Collective repository. */
export const legacyProposalArchive: LegacyProposalArchiveItem[] = [
  {
    id: "monroe-maldives-2027",
    title: "Monroe Maldives 2027",
    client: "Linda Monroe McKenzie",
    occasion: "70th Birthday Celebration",
    travelWindow: "June 22 to 28, 2027",
    route: "/experiences/monroe-maldives",
    hostedUrl: null,
    hosting: "Legacy Next.js proposal route. No verified live public deployment URL was present in the uploaded archive.",
    source: "Uploaded Wendy Collective repository: app/experiences/monroe-maldives",
    sourceStatus: "Source route recovered. Live host and current deployment status still need verification.",
    reviewStatus: "supplier refresh needed",
    proposalMode: "Resort shortlist and itinerary guide",
    summary: "A six night Maldives celebration for three couples seeking three private pool overwater villas with an all inclusive meal plan.",
    knownDetails: [
      "Six adults, three couples",
      "Three private pool overwater villas, double occupancy",
      "Shortlist included OBLU SELECT Sangeli, VARU by Atmosphere, RIU Palace Maldivas, and OZEN LIFE MAADHOO",
      "Linda’s birthday is June 26, 2027",
      "Flights and personalized travel protection pricing remained pending",
    ],
    requiredBeforeSharing: [
      "Confirm a current host or rebuild a private current route in this workspace",
      "Recheck resort availability, group inventory, pricing, and applicable terms",
      "Confirm a client approved proposal before any new link is created",
    ],
    notes: "The source route is preserved as an internal recovery record. Original resort pricing must not be treated as current.",
    sharePolicy: "not_shareable",
  },
  {
    id: "chanelle-turns-30",
    title: "Chanelle’s 30th Birthday Celebration",
    client: "Chanelle Spotswood",
    occasion: "30th Birthday Celebration",
    travelWindow: "February 10 to 14, 2027",
    route: "/experiences/chanelle-turns-30",
    hostedUrl: null,
    hosting: "Legacy Next.js proposal route. The source repository does not include a verified public host for this route.",
    source: "Uploaded Wendy Collective repository: app/experiences/chanelle-turns-30",
    sourceStatus: "Source route recovered. Legacy handoff notes and visible proposal content conflict on the selected Riu property.",
    reviewStatus: "content reconciliation needed",
    proposalMode: "Hotel package, excursions, and traveler intake guide",
    summary: "A four adult Jamaica birthday trip with hotel options, transportation, excursions, and a former traveler information workflow.",
    knownDetails: [
      "Former visible proposal selected Hotel Riu Montego Bay in Jamaica",
      "Legacy private notes conflict with the visible proposal and mention Riu Reggae instead",
      "Two rooms with two double beds were requested, priced on double occupancy",
      "Legacy notes listed garden view and sea view room figures",
      "Airfare was not included in the legacy planning notes",
    ],
    requiredBeforeSharing: [
      "Confirm the selected hotel and package scope with Wendy",
      "Recheck current hotel availability, pricing, protection, excursions, and payment terms",
      "Use a safe traveler profile workflow instead of the legacy passport and sensitive data form",
    ],
    notes: "The uploaded source contains a client intake form that should not be reused because it requests passport and other sensitive information.",
    sharePolicy: "not_shareable",
  },
  {
    id: "denise-ruff-family-holiday-2026",
    title: "Denise Ruff’s Family Holiday 2026",
    client: "Denise Ruff",
    occasion: "Family Holiday",
    travelWindow: "December 26, 2026 to January 2, 2027, or December 28 to 31, 2026",
    route: "/experiences/denise-ruff-family-holiday-2026",
    hostedUrl: null,
    hosting: "Legacy Next.js proposal route. No verified live public deployment URL was present in the uploaded archive.",
    source: "Uploaded Wendy Collective repository: app/experiences/denise-ruff-family-holiday-2026",
    sourceStatus: "Source route recovered. Legacy comparison content is available for review but prices and promotions are stale.",
    reviewStatus: "supplier refresh needed",
    proposalMode: "Two ship comparison guide",
    summary: "A two ship holiday comparison between Carnival Mardi Gras from Port Canaveral and Royal Caribbean Wonder of the Seas from Miami.",
    knownDetails: [
      "Carnival Mardi Gras: seven nights from Port Canaveral, December 26 through January 2",
      "Royal Caribbean Wonder of the Seas: three nights from Miami, December 28 through December 31",
      "The legacy comparison included cabin categories, date tradeoffs, and supplier actions",
      "The original promotion expired on August 22, 2026",
    ],
    requiredBeforeSharing: [
      "Confirm whether this family still wants the comparison and these travel dates",
      "Obtain fresh supplier quotes, availability, deposit terms, and promotion details",
      "Create a new approved private proposal rather than reusing stale fare cards",
    ],
    notes: "This is distinct from the older Denise 50th cruise brochure. Do not merge the two records.",
    sharePolicy: "not_shareable",
  },
  {
    id: "osx-command-bahamas",
    title: "OSX Command Bahamas",
    client: "OmniScope",
    occasion: "Executive Retreat",
    travelWindow: "Dates to be confirmed",
    route: null,
    hostedUrl: "https://omniscope-bahamas-resorts.wendailey.chatgpt.site",
    hosting: "Separate hosted proposal at wendailey.chatgpt.site. The uploaded repository’s private registry points to this external host.",
    source: "Uploaded Wendy Collective repository: private registry and recovery notes",
    sourceStatus: "Verified external host responds, but source ownership, client privacy, and current proposal state still require Wendy confirmation.",
    reviewStatus: "source access needed",
    proposalMode: "Luxury resort shortlist with anonymous resort vote",
    summary: "Four Bahamas resort finalists for an executive retreat and team travel, with a password protected results experience referenced in the legacy registry.",
    knownDetails: [
      "Current finalists were The Cove Eleuthera, Pink Sands Resort, French Leave Resort, and Grand Isle Resort & Residences",
      "The group intended to stay together while a small team traveled to Grand Bahama for same day meetings",
      "Final dates, adult and child counts, and villa or suite mix remained open",
      "Legacy registry referenced an anonymous resort vote and password protected results page",
    ],
    requiredBeforeSharing: [
      "Confirm Wendy’s authorization to open the external host from the CRM",
      "Confirm current client, dates, itinerary, images, and privacy settings",
      "Verify the external host and results page before sharing any link",
    ],
    notes: "The external proposal is the only recovered legacy record with a verified live host. It remains an external link and is not copied into the public website.",
    sharePolicy: "not_shareable",
  },
  {
    id: "denise-ruff-50th-cruise",
    title: "Denise Ruff’s 50th Birthday Cruise",
    client: "Denise Ruff",
    occasion: "50th Birthday Cruise",
    travelWindow: "Travel dates unavailable in supplied archive",
    route: null,
    hostedUrl: null,
    hosting: "Standalone legacy brochure recovered at public/brochures/denise-50th-cruise.html. No verified external host was supplied.",
    source: "Uploaded Wendy Collective repository: public/brochures/denise-50th-cruise.html",
    sourceStatus: "Static brochure recovered. It contains historical cruise comparison content and a legacy form that must not be reused.",
    reviewStatus: "historical reference only",
    proposalMode: "Cruise comparison brochure",
    summary: "A separate older Denise cruise brochure retained to prevent it from being confused with Denise Ruff’s Family Holiday 2026 comparison.",
    knownDetails: [
      "The brochure compared Norwegian, Royal Caribbean, and MSC options",
      "It included ship links, activity highlights, and historical planning notes",
      "It included a legacy form requesting disallowed sensitive information",
      "No current itinerary, quote, or approved client link was included in the archive",
    ],
    requiredBeforeSharing: [
      "Locate the authoritative source and confirm the correct client record",
      "Confirm whether the proposal is active or historical only",
      "Rebuild only with Wendy approved current itinerary and a safe traveler profile form",
    ],
    notes: "Reference entry only. This separate legacy form is intentionally excluded from the current CRM because it requests disallowed sensitive information.",
    sharePolicy: "not_shareable",
  },
];

export function getLegacyProposalArchive() {
  return legacyProposalArchive;
}
