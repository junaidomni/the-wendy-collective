# The Wendy Collective Client Journey and Proposal Workspace

## Executive recommendation

The desired experience is not an instant online cruise checkout. It is a **human-led advisor workflow**: a visitor expresses interest, Wendy has a discovery call, Wendy creates a tailored proposal, the traveler submits reservation details through a secure project link, and Wendy confirms live pricing and completes the booking in her authorized supplier or host-agency system.

This structure fits the way Wendy actually sells travel. It keeps her personal consultation at the center, supports both custom requests and fixed group opportunities, and prevents the public website from presenting a fare as guaranteed when cruise pricing, cabin availability, taxes, promotions, and room occupancy can change.

> The website should collect interest and organized traveler details. Wendy’s authorized booking platform should remain the source of truth for live availability, final price, deposits, and the actual reservation.

## The end-to-end client journey

| Stage | Client experience | Wendy’s private workspace | Main outcome |
|---|---|---|---|
| 1. New inquiry | A simple “Plan Your Journey” form asks destination or cruise interest, timing, party size, budget comfort, and contact details. | A new inquiry appears in Wendy’s queue and generates an alert. | Wendy knows who to call and why they reached out. |
| 2. Discovery call | The visitor speaks with Wendy. No booking commitment is implied online. | Wendy captures preferences, ship or destination options, room count, traveler count, and target dates. | A qualified trip opportunity is created. |
| 3. Proposal preparation | The client waits for Wendy’s curated options. | Wendy selects a proposal template, adds her approved ship, itinerary, hotel, inclusions, images, and notes. | A client-ready proposal is prepared. |
| 4. Proposal delivery | The client receives a private email or text link to a branded online proposal. | Wendy sees delivery status and can resend the link. | The client can review the relevant experience without viewing another customer’s information. |
| 5. Reservation request | The client clicks “Request My Cabin” or “Share Traveler Details,” chooses rooms, and adds traveler details. | Wendy sees rooms, travelers, supplier membership numbers, and request status. | Wendy has an organized booking request, not an automatic booking. |
| 6. Live quote and approval | Wendy calls or emails the live quote and deposit requirements. | Wendy records the verified quote, expiration, conditions, and decision. | The client approves or declines the current offer. |
| 7. Booking and travel support | The traveler receives confirmations and later travel documents through a secure link. | Wendy records confirmation numbers, payment milestones, document tasks, and service notes. | The trip moves from booked to travel-ready. |

## Two distinct booking paths

The system should deliberately separate **custom trips** from **group deals**. They look similar to visitors but have different pricing and inventory rules.

| Area | Custom cruise or individual family trip | Locked group cruise or promoted deal |
|---|---|---|
| Starting point | General inquiry and discovery call | A public deal page or a shared group proposal link |
| Pricing on page | No precise price. At most, use a carefully labeled planning range after Wendy approves it. | A specific approved group rate may be shown only while Wendy confirms the group block, terms, capacity, and cutoff are current. |
| Client action | “Request a proposal” or “Share travel details” | “Request a cabin” or “Request this group rate” |
| Availability | Wendy checks live supplier inventory after the request. | The workspace tracks the held rooms, requested rooms, release date, and waitlist. |
| Booking promise | Never state that a cabin is held or booked by form submission alone. | Never state that the rate is guaranteed until Wendy verifies the request and supplier availability. |
| Best use | One room, several rooms, custom dates, or a family planning a unique trip | School graduation cruise, reunion, hosted group, wedding group, or a promoted cabin block |

### Normal booking path

For a standard inquiry, the public form should stay intentionally light. The purpose is to earn the call, not to make the client complete a long reservation packet before Wendy knows whether the trip is a fit. Wendy then creates a private **Trip Project** in her workspace and sends a tailored proposal link after the call.

The proposal link can include cruise information, ship facts, room examples, itinerary, relevant terms, and a button to begin a reservation request. Prices should be omitted until Wendy provides an approved planning figure or a live quote. A submitted request should create an internal task for Wendy, not a customer booking confirmation.

### Group deal path

For a group Wendy has already created, the public deal page should be a clear, polished invitation. It can show the ship, dates, itinerary, group amenities, allowed room configurations, a controlled “from” rate, applicable taxes and fees, deposit, deadline, and an availability note. It should be connected to one internal **Group Block** record that tracks the actual group details.

The public button should say **“Request Your Cabin”**, not “Book Now,” unless Wendy later adopts a supplier-approved online-booking process. After the request, Wendy verifies the rate and cabin availability, contacts the family, and books through her existing professional platform.

## Wendy’s private workspace

The current Wendy-only inquiry area should grow into a simple travel-advisor workspace rather than a complex general CRM. The main screen should be a pipeline, with one card per client or group project.

| Pipeline status | Purpose |
|---|---|
| New inquiry | Needs first response or call. |
| Discovery scheduled | Wendy has a call arranged. |
| Discovery complete | Preferences and trip direction are recorded. |
| Proposal in progress | Wendy is building or refining options. |
| Proposal sent | Client has a private proposal link. |
| Traveler details requested | Client has been invited to submit room and traveler information. |
| Ready for live quote | Wendy has sufficient details to check the supplier platform. |
| Quote shared | Current options, deposit, and expiration have been communicated. |
| Client deciding | Follow-up is needed. |
| Booked | Confirmation, payment plan, and travel-service tasks begin. |
| Closed or paused | The trip was declined, delayed, or no longer active. |

Each Trip Project should contain the inquiry, discovery notes, the selected proposal, room requests, traveler list, quote history, tasks, email or text log, booking references, and files. Wendy should be able to change a status with one click, leave an internal note, assign a next-follow-up date, and resend a private link.

## Room and traveler intake

The client-facing form should first ask **how many rooms** are needed and **how many travelers are in each room**. It should then generate one room section at a time. Each traveler section should collect only the details Wendy needs to request or price the booking.

| Collect in the reservation-request form | Do not collect in the custom portal |
|---|---|
| Legal first, middle, and last name | Credit-card number, security code, or bank details |
| Date of birth or age, based on supplier need | Passport number, passport scan, or Social Security number |
| Email and phone | Medical details except through an approved, purpose-specific process |
| Citizenship or residency only when required | Login credentials for cruise-line or host-agency accounts |
| Known supplier loyalty or membership number | Any document Wendy does not need at this reservation stage |
| Room preference and accessibility request | |

Payment-card environments have specific security obligations; PCI guidance treats cardholder data as sensitive and prohibits keeping card verification codes after authorization.[1][2] The safer design is to send the client to Wendy’s authorized host-agency, cruise-line, or payment-provider process for deposits and card authorization. The Wendy Collective portal can store the booking-request record and a payment-status indicator such as “deposit requested” or “deposit confirmed,” but not the card data itself.

## Proposal and private-link design

Every proposal should be a branded page created from a reusable template. It is more useful than a static PDF because Wendy can update notes, share a new version, and receive organized client responses. PDFs can still be generated later for travelers who prefer one.

Private links should be specific to one Trip Project and should not rely on a reusable public password. A strong version is an expiring, single-client link delivered to the approved email address, optionally protected by a one-time verification code. The client sees only their own trip, while Wendy sees the complete workspace. Client portal systems commonly use private access controls and specific permissions for documents and files, which is the correct model for proposal sharing.[3]

## Cruise content and data strategy

Build a small **approved cruise-content library** for evergreen information: ship name, ship class, public ship image rights, itinerary, room-family explanations, dining and activity highlights, age rules, official links, and Wendy’s approved wording. Wendy can reuse this material in proposals without rebuilding every page.

Do **not** treat general online content as a live booking database. Live fares, promotions, cabins, deposits, and inventory should come from Wendy’s authorized host-agency or supplier booking tools, through a verified integration if one is actually available, or by Wendy’s manual entry after a supplier quote. A live-price integration is a separate commercial and security decision, not a simple web-scraping task.

## Architecture choices to decide between

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---|---|
| **Custom Wendy workspace inside the current website** | Gives Wendy one branded system for inquiries, projects, private proposals, room requests, status tracking, and group deals. It requires a focused build and ongoing ownership. | No separate portal subscription, but development time and maintenance apply. | Higher initial setup; strongest fit for a tailored workflow. |
| **Specialized travel CRM or white-label client portal alongside the website** | Faster access to proposals, document exchange, and perhaps payments. The client experience can feel less native, and data may be split between platforms. | Typically recurring subscription and possible per-user or payment fees. | Lower initial build; requires workflow and branding configuration. |
| **Hybrid launch: custom Wendy workspace for intake and proposals, existing host-agency system for pricing and booking** | Keeps Wendy’s human workflow and supplier process intact while avoiding a premature live-booking integration. Some manual handoff remains. | Low incremental platform cost if Wendy already has host-agency access; development is limited to the portal workflow. | Moderate; this is the safest school-cruise pilot pattern. |

No technical choice should be made until Wendy confirms the exact name of her host-agency or booking platform, whether it offers approved integration access, and where final payments and travel documents must live.

## School graduation cruise as the first pilot

The school cruise is the right first example because it exercises both sides of the system: a polished group-deal page for families and an internal group-management workspace for Wendy. It should be built only once Wendy confirms the authoritative ship, sailing dates, group rate, deposit, room inventory, release date, required rooming policy, and who can access the private family proposal.

| Pilot deliverable | Why it comes first |
|---|---|
| Group Deal record | Holds the locked rate, room block, deadline, terms, and client-facing copy in one source of truth. |
| School cruise landing page | Lets families understand the trip and request a cabin without seeing internal notes or supplier codes. |
| Room and traveler request form | Tests the room-count and repeating-traveler workflow Wendy needs. |
| Wendy pipeline and request board | Lets Wendy contact each family, track follow-up, and move requests from interest to quoted to booked. |
| Secure family proposal link | Gives the school group a focused, branded place for approved trip details and later documents. |

## Decisions to get from Wendy before implementation

1. What is the exact host-agency or booking platform Wendy uses for live cruise quoting and reservations, and does it have an approved integration or only a secure staff login?
2. For the school cruise, which ship, sailing date, room block, payment deadline, deposit, and group rate are authoritative today?
3. Should group rates be visible on the public deal page, or only after Wendy sends a private proposal link?
4. Should clients receive their private link by email only, or by both email and text message after they consent to text communication?

## Recommended sequence once approved

First, confirm the school-cruise facts and preserve the correct existing proposal material. Second, build the internal Trip Project, Group Deal, room-request, traveler-record, and status pipeline data model. Third, create the school’s public deal page and private family proposal experience. Fourth, connect Wendy’s existing email alerts and add optional text messaging only after consent language and provider details are approved. Fifth, generalize the proven school workflow into reusable templates for custom cruises, family trips, reunions, and future hosted groups.

## References

[1] [International Air Transport Association, PCI DSS standards for travel agents](https://www.iata.org/en/services/finance/pci-dss/)

[2] [PCI Security Standards Council, FAQ 1574 on card-verification-code storage](https://www.pcisecuritystandards.org/faqs/1574/)

[3] [SuiteDash, client portal use case for travel agencies](https://suitedash.com/use-cases/travel-agent-agency-client-portal/)
