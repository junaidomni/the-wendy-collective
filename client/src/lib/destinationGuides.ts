export type TravelType = "caribbean" | "mexico" | "allInclusive" | "groupTravel" | "cruise" | "custom";

export type DestinationGuide = {
  slug: string;
  label: string;
  title: string;
  italic: string;
  summary: string;
  image: string;
  imageAlt: string;
  travelType: TravelType;
  idealFor: string[];
  moments: string[];
  planningNote: string;
  inquiryLabel: string;
};

export const destinationGuides: DestinationGuide[] = [
  {
    slug: "caribbean",
    label: "Caribbean",
    title: "Caribbean, at your",
    italic: "own pace.",
    summary: "Salt air, still water, and an escape that moves at exactly the rhythm you need.",
    image: "/manus-storage/twc-caribbean_1a3e0036.jpg",
    imageAlt: "A secluded Caribbean shoreline with clear turquoise water",
    travelType: "caribbean",
    idealFor: ["A deeply restorative couples’ escape", "Family time with space for everyone", "An island celebration with an easygoing feel"],
    moments: ["A resort chosen for its atmosphere, not just its address", "Boat days, local flavor, and time with nothing scheduled", "An island rhythm that makes room for rest"],
    planningNote: "The right Caribbean experience is about more than choosing an island. Wendy helps consider the beach, setting, travel time, room style, and the small details that shape the whole stay.",
    inquiryLabel: "Plan a Caribbean escape",
  },
  {
    slug: "mexico",
    label: "Mexico",
    title: "Coast, culture, and",
    italic: "calm.",
    summary: "A beautiful blend of coastlines, easy hospitality, and places with a real sense of their own character.",
    image: "/manus-storage/twc-mexico_b427d449.jpg",
    imageAlt: "A quiet contemporary Mexico resort courtyard",
    travelType: "mexico",
    idealFor: ["A sunlit couples’ trip", "A multigenerational stay with simple logistics", "A celebration that pairs relaxation with a sense of place"],
    moments: ["A coast and hotel atmosphere that fit your style", "Slow breakfasts, excellent evenings, and time to wander", "A stay with both ease and personality"],
    planningNote: "Mexico offers many different versions of a great escape. Wendy helps make the options feel manageable, from the right coast and room to the balance between pool time, culture, and evenings out.",
    inquiryLabel: "Plan a Mexico stay",
  },
  {
    slug: "all-inclusive",
    label: "All Inclusive Escapes",
    title: "Everything considered.",
    italic: "Nothing rushed.",
    summary: "An all inclusive stay, selected for the experience behind the word: the setting, energy, dining, service, and space to simply enjoy it.",
    image: "/manus-storage/twc-mexico_b427d449.jpg",
    imageAlt: "A warm modern resort retreat with tropical plants",
    travelType: "allInclusive",
    idealFor: ["A true reset with fewer decisions to make", "A milestone trip where the details should feel easy", "A family or friends’ escape with a clear shared plan"],
    moments: ["A resort matched to your preferred pace and energy", "Days that can be as social or as slow as you like", "An effortless base for a celebration or a reset"],
    planningNote: "Not every all inclusive experience is alike. Wendy looks past the brochure to help align the feel of the resort, room setup, dining style, location, and inclusions with the trip you actually want.",
    inquiryLabel: "Explore all inclusive options",
  },
  {
    slug: "groups",
    label: "Group Journeys",
    title: "Together, beautifully",
    italic: "planned.",
    summary: "Milestones, reunions, and shared memories deserve a plan that keeps the moving pieces clear and the experience joyful.",
    image: "/manus-storage/twc-hero-travel-film_89224a2a.jpg",
    imageAlt: "A cinematic view from an airplane above a field of clouds",
    travelType: "groupTravel",
    idealFor: ["A milestone birthday or family gathering", "Friends traveling together without logistical stress", "A wedding or celebration focused escape"],
    moments: ["One thoughtful plan that makes room for every traveler", "Stays and experiences selected around the group’s reason for going", "Clear coordination, without losing the feeling of a vacation"],
    planningNote: "Group travel asks for a steadier hand: shared decisions, room needs, timelines, and individual preferences. Wendy helps give the group a clear plan while preserving the moments that brought everyone together.",
    inquiryLabel: "Plan a group journey",
  },
  {
    slug: "cruises",
    label: "Cruises and Coastlines",
    title: "See more. Settle",
    italic: "in.",
    summary: "A voyage with the right ship, the right pace, and the shore days that turn a sailing into a complete travel story.",
    image: "/manus-storage/twc-hero-travel-film_89224a2a.jpg",
    imageAlt: "Cinematic airplane window view above golden clouds",
    travelType: "cruise",
    idealFor: ["Couples who want both variety and ease", "Families and groups who want to explore together", "Travelers who enjoy waking up somewhere new"],
    moments: ["A sailing selected around how you like to spend your time", "Cabin, itinerary, and shore moments considered together", "A stay before or after your cruise that rounds out the journey"],
    planningNote: "The right cruise is a matter of fit. Wendy helps make sense of ships, cabin styles, itineraries, and the travel moments before and after you board, so the whole journey feels connected.",
    inquiryLabel: "Plan a cruise",
  },
];

export function getDestinationGuide(slug: string) {
  return destinationGuides.find((guide) => guide.slug === slug);
}

export function guideInquiryHref(guide: DestinationGuide) {
  const parameters = new URLSearchParams({ type: guide.travelType, destination: guide.label, guide: guide.slug });
  return `/contact?${parameters.toString()}`;
}
