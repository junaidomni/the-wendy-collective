export type LegacyProposalArchiveItem = {
  id: string;
  title: string;
  client: string;
  occasion: string;
  travelWindow: string;
  route: string | null;
  source: string;
  sourceStatus: string;
  reviewStatus:
    | "source access needed"
    | "supplier refresh needed"
    | "content reconciliation needed"
    | "historical reference only";
  summary: string;
  knownDetails: string[];
  requiredBeforeSharing: string[];
  notes: string;
  sharePolicy: "not_shareable";
};

/**
 * Internal reconstruction index derived only from the legacy handoff materials
 * supplied to this project. These are intentionally not public proposal pages,
 * client links, or booking records. Source access and Wendy's review are
 * required before any client-facing proposal can be created or shared.
 */
export const legacyProposalArchive: LegacyProposalArchiveItem[] = [
  {
    id: "monroe-maldives-2027",
    title: "Monroe Maldives 2027",
    client: "Linda Monroe McKenzie",
    occasion: "70th Birthday Celebration",
    travelWindow: "June 22 to 28, 2027",
    route: "/experiences/monroe-maldives",
    source: "Monroe Maldives 2027 Manus Handoff",
    sourceStatus:
      "Listed as a native route in Wendy's former Next.js repository and centralized private area. The referenced repository is not accessible in this workspace.",
    reviewStatus: "supplier refresh needed",
    summary:
      "A six night Maldives celebration for three couples seeking three private pool overwater villas with an all inclusive meal plan.",
    knownDetails: [
      "Six adults, three couples",
      "Three private pool overwater villas, double occupancy",
      "Shortlist included OBLU SELECT Sangeli, VARU by Atmosphere, RIU Palace Maldivas, and OZEN LIFE MAADHOO",
      "Original handoff marked flights, itinerary, excursions, and personalized travel protection as pending",
    ],
    requiredBeforeSharing: [
      "Confirm access to the original source and former private record",
      "Recheck resort availability, group inventory, pricing, and applicable terms",
      "Confirm a client approved proposal before any new link is created",
    ],
    notes:
      "Historical reference only. The original pricing verification was dated July 24, 2026 and must not be treated as current.",
    sharePolicy: "not_shareable",
  },
  {
    id: "chanelle-turns-30",
    title: "Chanelle's 30th Birthday Celebration",
    client: "Chanelle Spotswood",
    occasion: "30th Birthday Celebration",
    travelWindow: "February 10 to 14, 2027",
    route: "/experiences/chanelle-turns-30",
    source: "Chanelle 30th Birthday Celebration Manus Handoff",
    sourceStatus:
      "Former Wendy route was an iframe wrapper for a separate Vercel experience. Standalone source and Vercel project access are not available in this workspace.",
    reviewStatus: "content reconciliation needed",
    summary:
      "A four adult Jamaica birthday trip with a legacy land package and a separate external traveler form.",
    knownDetails: [
      "Former visible proposal selected Hotel Riu Montego Bay in Jamaica",
      "Legacy private notes conflict with the visible proposal and mention Riu Reggae instead",
      "Original plan used two connecting garden view rooms for four adults",
      "The external traveler form and standalone hosted experience are not activated here",
    ],
    requiredBeforeSharing: [
      "Obtain standalone source and Vercel project access",
      "Confirm the selected hotel, package scope, protection language, excursions, and payment schedule",
      "Recheck all pricing, form privacy settings, and notification recipients",
    ],
    notes:
      "Do not treat the former iframe or form as available. Conflicting legacy content requires Wendy's approval before rebuilding a client facing proposal.",
    sharePolicy: "not_shareable",
  },
  {
    id: "denise-ruff-family-holiday-2026",
    title: "Denise Ruff's Family Holiday 2026",
    client: "Denise Ruff",
    occasion: "Family Holiday",
    travelWindow:
      "December 26, 2026 to January 2, 2027, or December 28 to 31, 2026",
    route: "/experiences/denise-ruff-family-holiday-2026",
    source: "Denise Ruff Family Holiday 2026 Manus Handoff",
    sourceStatus:
      "Unmigrated legacy source in the older OneDrive checkout. It was absent from the former active repository and private dashboard.",
    reviewStatus: "supplier refresh needed",
    summary:
      "A two ship holiday comparison between Carnival Mardi Gras from Port Canaveral and Royal Caribbean Wonder of the Seas from Miami.",
    knownDetails: [
      "Carnival Mardi Gras: seven nights from Port Canaveral",
      "Royal Caribbean Wonder of the Seas: three nights from Miami",
      "Legacy interface exposed supplier category codes that should not be client facing",
      "The original promotion expired on August 22, 2026",
    ],
    requiredBeforeSharing: [
      "Confirm whether this family still wants the comparison and these travel dates",
      "Obtain fresh supplier quotes, availability, deposit terms, and promotion details",
      "Use client friendly room labels if a new approved proposal is built",
    ],
    notes:
      "This is distinct from the older Denise 50th cruise brochure. Do not merge the two records.",
    sharePolicy: "not_shareable",
  },
  {
    id: "osx-command-bahamas",
    title: "OSX Command Bahamas",
    client: "Client details unavailable in supplied handoff",
    occasion: "Bahamas proposal",
    travelWindow: "Travel dates unavailable in supplied handoff",
    route: null,
    source: "Legacy proposal recovery notes",
    sourceStatus:
      "Referenced as a separate Vercel project whose source was not available locally. The original social image hostname was reported as broken.",
    reviewStatus: "source access needed",
    summary:
      "A legacy Bahamas proposal preserved as a reference entry while its original project, source, and client scope are recovered.",
    knownDetails: [
      "Formerly referenced as OmniScope Bahamas in handoff notes",
      "Separate project and source location were not available to the prior implementation",
      "Original social preview configuration requires review",
    ],
    requiredBeforeSharing: [
      "Obtain source control and Vercel project access",
      "Confirm client, dates, itinerary, pricing, images, and privacy requirements",
      "Repair and validate sharing metadata only after the authoritative route is confirmed",
    ],
    notes:
      "Named OSX Command Bahamas in this archive. No client link, proposal content, or pricing has been recreated.",
    sharePolicy: "not_shareable",
  },
  {
    id: "denise-ruff-50th-cruise",
    title: "Denise Ruff's 50th Birthday Cruise",
    client: "Denise Ruff",
    occasion: "50th Birthday Cruise",
    travelWindow: "Travel dates unavailable in supplied handoff",
    route: null,
    source: "Denise Ruff Family Holiday 2026 Manus Handoff",
    sourceStatus:
      "Referenced only as an older, separate cruise brochure in the legacy checkout. Its route, source files, and current status are not available in this workspace.",
    reviewStatus: "historical reference only",
    summary:
      "A separate older Denise cruise brochure retained to prevent it from being confused with Denise Ruff's Family Holiday 2026 comparison.",
    knownDetails: [
      "Separate artifact from the Family Holiday 2026 comparison",
      "No verified itinerary, dates, pricing, or source route was included in the supplied handoff",
    ],
    requiredBeforeSharing: [
      "Locate authoritative source files and confirm the correct client record",
      "Confirm whether the proposal is active or historical only",
      "Rebuild only with Wendy approved current itinerary and pricing",
    ],
    notes:
      "Reference entry only. It must remain separate from Denise Ruff's Family Holiday 2026 record.",
    sharePolicy: "not_shareable",
  },
];

export function getLegacyProposalArchive() {
  return legacyProposalArchive;
}
