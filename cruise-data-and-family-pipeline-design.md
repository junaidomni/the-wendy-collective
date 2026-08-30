# Wendy Collective Cruise Data and Family Pipeline Blueprint

## Purpose

This document converts the requested advisor workflow into a buildable CRM design. The Wendy Collective website is not a cruise booking engine. It is Wendy’s private operating system for turning a conversation into a reviewed travel plan, a tailored client link, and then an advisor-led booking through an authorized supplier or host-agency tool.

The immediate build should focus on two connected pipelines. The first helps Wendy select and prepare a cruise. The second returns the household’s requested rooms and traveler details to Wendy in an organized review record. Pricing, inventory, and booking remain manual advisor actions until an approved supplier integration is available.

## The Core Rule

> A client link collects preferences and booking-ready details. It never guarantees a fare, holds a stateroom, or takes a payment.

That rule keeps client expectations clear and lets Wendy verify the live cabin, promotion, fare, and terms in the supplier system before accepting a booking. Carnival describes GoCCL Navigator as its advisor booking tool for searching, viewing, comparing offers, and managing stateroom booking information. Royal Caribbean and Norwegian similarly direct advisors to their authenticated professional portals for planning, booking, and management.[1][2][3]

## The CRM Should Have Six Separate Work Areas

| Workspace | Wendy’s purpose | What belongs there | What does not belong there |
| --- | --- | --- | --- |
| **Today** | Decide what to do next | Due calls, scheduled discovery appointments, expiring links, new family requests, quotes awaiting follow up | Full forms and catalog management |
| **Pipeline** | See the current work by stage | One card per client or group, stage count, next action, meeting date, owner | A long all-in-one proposal editor |
| **Clients** | Open an individual household or traveler record | Contact details, discovery notes, proposals, activity, booking reference | Group-level rules that apply to every family |
| **Trips and Groups** | Open a shared group or hosted program | Ship, sailing, itinerary, group terms, cabin strategy, response counts, coordinator | Individual payment or passport information |
| **Proposals** | Create and manage client-safe links | Draft, shared, revised, responded, quoted, expired links | Internal supplier login details or private advisor notes |
| **Library** | Keep reusable approved content | Cruise lines, ship profiles, sailings, itinerary facts, images, room guidance, amenity definitions | Live availability represented as permanent facts |

## Stage Model

The stages should be visible as focused folders, not as a single page. Every stage opens a filtered list, and each card opens a full record.

| Stage | Meaning | Required information to leave the stage | Primary next action |
| --- | --- | --- | --- |
| **New inquiry** | A client or coordinator has expressed interest | Contact method and initial request | Respond or schedule discovery |
| **Discovery scheduled** | Wendy has a call or meeting planned | Date, time, timezone, meeting channel, agenda | Hold discovery |
| **Proposal preparation** | Wendy is selecting travel and building the client experience | Travel criteria, ship or itinerary choice, likely cabin path, proposal validity | Prepare private draft |
| **Ready to share** | The link has been reviewed and can go to the client | Client-safe summary, imagery, itinerary, caveat, request window | Activate and send link |
| **Family details received** | A family or client has sent room and traveler preferences | Complete household response and Wendy review state | Check live fare and inventory |
| **Live quote** | Wendy has a time-sensitive supplier result to discuss | Supplier quote timestamp, categories, total, terms, expiry | Present or revise quote |
| **Booking in progress** | The client has confirmed the live quote and Wendy is booking in the supplier portal | Required supplier checks and secure payment workflow outside this site | Complete booking |
| **Booked and supported** | Confirmation is recorded and the trip is being serviced | Reservation reference, payment schedule, travel documents checklist | Manage pretravel support |
| **Closed** | The client chose not to proceed or the program ended | Close reason and final note | Archive or reengage later |

The current `Discovery call` label should become **Discovery scheduled** in the interface. The CRM should store a meeting date and a short agenda. A later Google Calendar connection can create the actual event and return its meeting link, but this first release should work without a calendar integration.

## Pipeline One: Advisor Cruise Selection and Proposal Preparation

This is the workflow Wendy uses before a client receives a link.

### 1. Open the client or group profile

Wendy begins from a specific profile, not from the general Library. For Grimsley, that record is **Grimsley High School Graduation Cruise 2027**. For an individual client, it is the household’s profile. The profile should show the current stage, next action, conversation history, and the exact information still missing.

### 2. Select the travel product from the Library

The Library needs two levels of structured content:

| Level | Examples | How it is used |
| --- | --- | --- |
| **Ship profile** | Carnival Mardi Gras, Norwegian Aqua, Royal Caribbean Icon of the Seas | Reusable ship facts, hero image, in-service year, guest capacity, dining style, included features, deck overview, family notes, and room-category descriptions |
| **Sailing profile** | Mardi Gras, June 24 to 28, 2027, Port Canaveral | Departure date, return date, embarkation port, itinerary, group rules, source URL or supplier reference, review date, room categories, and quote caveat |

The selection flow should be **Cruise line → Ship → Sailing date or date range → Itinerary → Cabin categories → Optional amenities**. If Wendy does not find a sailing, she creates a draft sailing from the client profile, then saves it into the Library only after the data is reviewed.

### 3. Prepare the proposal

The builder should guide Wendy through short sections instead of presenting a large form:

1. **Experience:** ship, sailing, embarkation port, itinerary, approved image.
2. **Client message:** Wendy’s personal introduction and next step.
3. **Cabin choices:** categories, relevant decks, forward, mid ship, aft guidance, occupancy notes, and request-only language.
4. **Optional amenities:** WiFi, beverage package, soda package, specialty dining, transfers, insurance, accessibility notes, and any group inclusions. These are preferences, not purchases.
5. **Commercial context:** either a clearly marked starting rate or no price yet, plus a price-verification note, quote expiration, and group terms.
6. **Request window:** the date by which the client should respond.
7. **Review and share:** draft preview, required-field checklist, activate a private link, copy the link, and record the send date.

### 4. Create a token-protected family link

The existing private-link pattern is the correct foundation. The new proposal page should be a polished guided experience with the ship image and full client-safe description. It should be noindex, expiration-aware, revocable, and unavailable until Wendy explicitly activates it.

## Pipeline Two: Family Details and Advisor Review

This begins only after Wendy has sent the private proposal link.

### The Client Experience

The client sees the proposal in this order:

| Section | Purpose |
| --- | --- |
| **Welcome and trip at a glance** | Ship image, sailing date, port, itinerary, and Wendy’s note |
| **About the ship** | Approved ship facts, what makes the experience useful for this client or group, and deck or cabin guidance |
| **Choose rooms** | Add one or more rooms; select occupancy and preferred cabin category |
| **Placement preferences** | Choose forward, mid ship, aft, or no preference; add a near-elevator, low-motion, or accessible-room request where applicable |
| **Travelers** | Legal first, middle, and last name; date of birth; age at sailing; loyalty number if known; special assistance or celebration notes |
| **Preferences** | Choose optional WiFi, beverage, soda, dining, transfer, insurance, and other trip-specific preferences. These must be labeled as request preferences, not confirmed additions. |
| **Review and send** | Consent to Wendy’s privacy terms, submit the request, and see a confirmation that Wendy will review the current live availability and quote. |

### Data Wendy Receives

The advisor view must render the returned request as a readable **family booking brief**, not as raw form data. Each response should show the contact, response date, selected rooms, cabin placement preference, traveler roster, loyalty numbers, amenities requested, special notes, and whether Wendy has reviewed, quoted, closed, or needs a follow-up call.

Wendy should be able to edit the internal booking brief after submission. Edits must be recorded as advisor changes and should not overwrite the original household request. The interface should display both **Client submitted** and **Wendy’s working details**.

## Information That Must Not Be Collected on This Website

The site must not accept payment-card data, card verification codes, supplier portal credentials, passport scans, passport numbers, Social Security numbers, or uploaded government identification. Payment-card environments have specific PCI DSS obligations, and IATA advises travel agents to evaluate where card details are processed and stored and obtain the appropriate compliance evidence.[4] APIS is a carrier or approved-system process for transmitting passenger manifest data, not a reason to treat this marketing and CRM website as a passport repository.[5]

For the initial implementation, clients can provide legal name, date of birth, loyalty number, country of residence, known travel-document status, and special assistance notes. Wendy should collect sensitive passport or payment information only through the authorized supplier or host-agency workflow after a live quote is accepted. If a future secure document or payment product is chosen, it requires a separate security, privacy, retention, and vendor review.

## Supplier Data Strategy

The requested ability to search every cruise line needs a phased approach. The CRM should not scrape consumer websites or depend on unofficial third-party claims of an API. Instead, it should use a reviewed internal Library first, then an approved supplier connection only after Wendy confirms who owns the agency account, what the provider permits, and which data may be displayed to clients.

| Phase | Data source | What Wendy can do | What it cannot claim |
| --- | --- | --- | --- |
| **Now** | Wendy-reviewed Library | Build beautiful ship and sailing proposals; save source, date reviewed, and imagery rights | Real-time prices, availability, or automatic reservation |
| **Next** | Carnival GoCCL, Royal Caribbean CruisingPower, Norwegian Central, or host-agency portal used manually by Wendy | Search live fares and cabins; bring verified selected details into the CRM as an advisor quote | Background automation or client self-booking |
| **Later** | Written, approved supplier or host-agency API contract | Synchronize permitted ship, sailing, fare, or availability fields | Any field the contract does not authorize; payment processing without PCI scope |

Carnival’s public advisor materials describe GoCCL as a travel-advisor booking tool with offer comparison and stateroom functions, while Royal Caribbean’s and Norwegian’s advisor portals are authenticated professional systems.[1][2][3] At the moment, this supports the workflow of Wendy checking live information in those authorized portals and then recording the verified result in The Wendy Collective. It does not establish that any of those systems provide a public API suitable for this website.

## Build Order

### Release A: Cruise Selection

Build the Library’s ship and sailing structures, add an advisor-facing cruise selector within a client or group profile, add a meeting date and meeting status to the discovery stage, and update the proposal builder to use a short guided review instead of one large form.

### Release B: Family Response

Add the client-safe ship overview, room builder, traveler form, placement preferences, loyalty number, and selectable amenity preferences. Save the original submission and render it in a structured Wendy review view. No passport or payment capture belongs in this release.

### Release C: Live Quote and Booking Management

Add quote versions, supplier source reference, quote timestamp, quote-expiration date, client communication notes, a manual booking checklist, reservation reference, payment due-date reminders, and a post-booking support checklist.

### Release D: Authorized Integrations

Only after Wendy supplies an authorized agency or host-agency account, provider documentation, and approved credentials: assess the provider’s terms and integration route. Add provider data one connection at a time, beginning with the portal Wendy actually uses most often.

## Decisions Needed From Wendy Before Release A Is Final

| Decision | Why it matters |
| --- | --- |
| Which advisor portal is the source of truth for each cruise line | Determines the manual live-quote workflow and any future integration path |
| Which ship facts she wants on client pages | Avoids unreviewed or stale general cruise content |
| Which amenities should appear per cruise line or group | Prevents clients from requesting unavailable package combinations |
| How long a family link should stay active | Sets the default 14, 30, or 60 day private-link rule |
| The exact Grimsley group terms and family request deadline | Required before the Grimsley link can be activated |
| Her preferred discovery-call process | Determines whether Release A should include a manual appointment field only or a future Google Calendar connection |

## References

[1]: https://www.carnival-news.com/2024/04/15/carnival-cruise-line-introduces-goccl-com-enhanced-booking-experience-for-travel-advisors "Carnival: GoCCL enhanced booking experience for travel advisors"
[2]: https://secure.cruisingpower.com/login "Royal Caribbean Group: CruisingPower travel professional portal"
[3]: https://norwegiancentral.ncl.com/ "Norwegian Central travel agent portal"
[4]: https://www.iata.org/en/services/finance/pci-dss/ "IATA: PCI DSS and travel agent compliance requirements"
[5]: https://www.cbp.gov/travel/travel-industry-personnel/advance-passenger-information-system "U.S. Customs and Border Protection: Advance Passenger Information System"
