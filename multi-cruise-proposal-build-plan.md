# Multi Cruise Proposal Build Plan

**Prepared for:** The Wendy Collective  
**Prepared by:** Manus AI  
**Status:** Planning only. No supplier search, pricing, booking, external calendar action, or client email is activated by this plan.

## Executive recommendation

The best structure is a **two layer proposal workflow**. Wendy first works privately in the CRM to narrow a large set of possibilities into a small curated shortlist. She then sends the client a private comparison link showing only the selected cruise possibilities and a simple preference form. The client can indicate which option interests them and provide room and traveler details. Wendy then verifies live availability and quotes through her authorized advisor channel before discussing price or booking.

This protects Wendy from showing stale inventory, avoids publishing pricing before it is verified, and gives clients a polished way to respond without turning the website into an automated booking engine.

> **Core rule:** The website organizes interest and traveler details. Wendy’s authorized supplier platform verifies live availability, pricing, taxes, deposits, and booking terms.

## What the new workflow needs to accomplish

| Wendy needs to do | The proposed CRM behavior | What the client sees |
|---|---|---|
| Understand the trip request | Capture destination, date range, departure city, travelers, budget comfort, cruise-line preferences, and must-haves in Discovery. | Nothing yet. This remains Wendy’s working record. |
| Explore possible cruises | Search Wendy’s reviewed cruise library now. Later, enrich the same screen with authorized supplier results. | Nothing yet. |
| Compare a few best options | Add two to four candidate sailings to a private comparison draft, write a short recommendation, and choose the order. | A branded, no-price comparison page with curated cruise cards. |
| Collect a decision and details | Review the selected option, room count, traveler details, cabin preferences, special needs, and notes in the originating record. | One clear “This is the option I am interested in” choice and an advisor-led request form. |
| Quote and book | Verify the live sailing in the approved advisor portal, then save the live quote and booking references in the current stage flow. | A personal update from Wendy. No automatic inventory hold, quote, or booking. |

## Recommended CRM experience

### 1. Discovery captures the search brief

After Wendy’s first conversation, the Discovery stage should create a reusable **Cruise Search Brief**. It is not a supplier search yet. It simply records the criteria Wendy will use:

| Search field | Example use |
|---|---|
| Departure window | June 6 through June 20, 2027 |
| Flexible dates | Plus or minus three days |
| Departure ports | Miami, Port Canaveral, or New Orleans |
| Cruise lines to consider | Carnival, Norwegian, Royal Caribbean |
| Nights | Five to seven nights |
| Destinations | Eastern Caribbean, Bahamas, or Alaska |
| Traveler composition | Two adults, two teens, one cabin preferred |
| Priorities | Ship entertainment, water features, balcony preference, budget sensitivity |
| Exclusions | No flights with more than one connection, no interior cabins |

The Search Brief should be visible at the top of Proposal Build, so Wendy never has to re-enter the client’s requirements.

### 2. Proposal Build becomes a controlled candidate board

The Proposal Build screen should have three focused columns:

| Column | Purpose | Rule |
|---|---|---|
| **Search criteria** | Displays and edits the Cruise Search Brief. | Changes are saved to the client record. |
| **Candidate sailings** | Holds results from the reviewed library now and later from an authorized provider lookup. | Every option must show source and review time. |
| **Client shortlist** | Holds the two to four options Wendy wants the client to compare. | Only shortlist options appear in a private comparison link. |

Each candidate sailing should contain the cruise line, ship, departure port, departure date, number of nights, itinerary highlights, ship image, suitability notes, source, and last-reviewed timestamp. **No public client price is required at this stage.** Wendy can retain internal planning notes, but not expose an unverified or expired price to the client.

### 3. The comparison link stays generic, curated, and private

Instead of rebuilding a separate Mardi Gras-style page for every lead, Wendy sends a **Private Cruise Comparison** link. It should be branded but reusable, with the client’s name, occasion, and travel window used only when Wendy chooses to add them.

Each client-facing cruise card includes:

| Client-facing content | Internal-only content |
|---|---|
| Cruise line and ship | Supplier reference, source URL, agent notes |
| Sail date, duration, port, itinerary summary | Live availability result and time checked |
| One approved ship image and short atmosphere note | Internal preliminary fare observations |
| “Why it may fit your trip” | Commission, supplier credential, or booking workflow details |
| Cabin approach, such as “balcony and family options can be reviewed” | Supplier account information |
| **I am interested in this option** action | Detailed quote preparation notes |

The form should first ask the client to select one preferred cruise. If the household has more than one viable choice, the page can allow a ranked first and second choice. It then collects the same approved details that Grimsley uses: contact information, rooms, travelers, age or date-of-birth only when needed for a later quote, cabin-placement preference, accessibility or dietary notes, and advisor notes. It never collects payment cards, passports, account passwords, or supplier credentials.

### 4. Client response returns to the specific proposal

When the client submits the comparison form, the response belongs only to that proposal. It does **not** create a New Inquiry, duplicate client, or unrelated pipeline card. Wendy sees a clear proposal alert such as:

> “New response for the June family cruise comparison. Preferred option: Norwegian Aqua, June 12 sailing.”

The existing source-specific alert model already used for Grimsley provides the right foundation. Wendy opens the original client record, reviews the selected option and room details, and moves deliberately to Family Details or Live Quote only when the record is ready.

## Cruise information strategy

The system should separate **durable cruise content** from **time-sensitive commercial availability**.

| Layer | What belongs there | Update method | Client exposure |
|---|---|---|---|
| Reviewed cruise library | Ship facts, approved images, general itinerary patterns, amenities, cabin guidance, destination fit, source link, review date. | Wendy adds or reviews each record. | May appear in a private comparison. |
| Sailings catalog | Specific ship, date, departure port, number of nights, itinerary, and availability status. | Wendy enters verified candidates first. Later, an approved provider sync can refresh them. | May appear in a private comparison only while Wendy marks it current. |
| Live quote | Current cabin availability, fare, taxes, fees, deposit, terms, and quote deadline. | Wendy retrieves it from an authorized advisor platform. | Shared personally by Wendy after verification. |
| Reservation | Supplier booking reference and booking milestones. | Wendy records it after booking through her approved channel. | Shown only in the appropriate private client record. |

Carnival’s GoCCL Navigator and Norwegian Central both present their booking tools behind travel-advisor credentials, rather than as public inventory services. [1] [2] InteleTravel’s public site positions the advisor as the planning and booking intermediary, but it does not publish a public advisor inventory API. [3] The safe design is therefore to support Wendy’s authorized workflows rather than scrape supplier sites or reuse a personal login in this application.

## Recommended implementation phases

### Phase A: Build the controlled comparison workflow first

This is the right next build because it delivers the client experience Wendy described without any supplier connection.

| Deliverable | What it provides | What it does not do |
|---|---|---|
| Cruise Search Brief | Saved filters and requirements in Discovery and Proposal Build. | Live supplier search. |
| Sailing candidate board | Manually added or library-sourced cruises that Wendy has reviewed. | Automatic fare or inventory retrieval. |
| Private comparison link | Two to four client-safe cruise choices and one selection form. | Public prices, booking, or payment. |
| Proposal response workspace | Selected cruise, rooms, travelers, preferences, history, and scoped alerts. | New Inquiry creation or duplicate pipeline records. |
| Quote handoff | A focused Live Quote checklist using the client’s selection. | Supplier API actions. |

### Phase B: Authorize a provider search connection

Only after Wendy confirms the supported source should the system add live availability. The choices should be compared before connection:

| Option | How it works | Benefits | Limits | Approval required |
|---|---|---|---|---|
| **Manual verified shortlist** | Wendy searches in her advisor portal and enters candidate sailings. | Fastest, safest, available immediately. | Requires Wendy to recheck current availability. | None beyond Wendy’s existing access. |
| **Approved InteleTravel workflow** | Wendy confirms the official InteleTravel method or partner integration. | Keeps the workflow aligned with her host agency. | Dependent on InteleTravel’s authorized capabilities. | Written confirmation of the sanctioned path and credentials. |
| **Direct supplier partner integration** | Carnival, Norwegian, or another supplier grants documented API or partner access. | Potentially richer live results. | More technical, provider-specific, may not support every line. | Supplier agreement, documentation, and secure credentials. |
| **Public website scraping** | Automated extraction from supplier consumer pages. | None appropriate for this CRM. | Unreliable, can violate terms, makes availability and price inaccurate. | Not recommended. |

### Phase C: Add client self-scheduling after calendar authorization

The prepared Calendar workspace should remain Wendy-only until she connects Google Calendar. Once authorized, the CRM can offer appointment slots based on her saved availability blocks, create a Google Calendar event, generate a Google Meet link when requested, and email the client confirmation. This must remain a separate authorization from cruise supplier access.

## Approval gates and protections

| Gate | Required before moving forward |
|---|---|
| Publish a cruise option to a private comparison | Wendy has reviewed its ship, itinerary, date, source, and client suitability. |
| Show a price to a client | Wendy has verified the live quote, inclusions, taxes, fees, cabin occupancy, deposit, and expiration. |
| Create a supplier lookup | Wendy confirms the official provider, approved integration path, and secure credential owner. |
| Create a calendar invitation or Meet link | Wendy connects and authorizes her Google Calendar account. |
| Record sensitive travel documents | Do not collect passport images, card data, passwords, or supplier credentials in this site. |

## Decision requested before implementation

The recommended first build is **Phase A only**: a generic multi-cruise comparison workflow backed by Wendy’s approved internal library and manual verified candidate sailings. It gives Wendy the four-cruise comparison link she described, keeps client responses connected to the right proposal, and requires no supplier API or price display.

Please confirm these choices before implementation:

1. Should clients be able to rank a first and second cruise choice, or select only one option?
2. Should the first version allow a maximum of **four** cruises per comparison link?
3. Should the comparison page show rough budget ranges that Wendy enters manually, or contain **no pricing at all** until the live quote stage?

## References

[1] [GoCCL Navigator](https://www.goccl.com/), accessed August 31, 2026.  
[2] [Norwegian Central](https://norwegiancentral.ncl.com/), accessed August 31, 2026.  
[3] [InteleTravel](https://www2.inteletravel.com/), accessed August 31, 2026.
