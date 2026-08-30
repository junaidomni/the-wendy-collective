# Wendy Workspace Restart Blueprint

**Purpose.** This is a design and workflow brief for rebuilding the Wendy workspace as a focused advisor CRM. It responds to the current problem: the workspace is technically capable, but it presents every job on one long page. The redesigned portal should make one decision at a time, keep the active pipeline visible, and open a dedicated client or group profile only when Wendy chooses it.

## What the research supports

Travel-advisor workflows work best when the CRM mirrors the real client journey instead of a generic sales funnel. A useful setup follows the movement from inquiry, discovery, proposal, quote, booking, travel, and follow-up. Travel advisor guidance specifically recommends mapping the real workflow first, then using client profiles, inquiries, proposal building, and task tracking as connected but distinct tools.[1] Advisor-sales guidance also emphasizes responding warmly and quickly, using a discovery conversation before deep research, and automating routine structure without replacing personal service.[2]

Digital proposals should be a focused client decision experience: a clear trip overview, selected options, any current price information that Wendy chooses to share, terms, and an explicit next action. It should not be a static document or a general public page.[3] Client portals reinforce this pattern by giving a traveler one branded location for the proposal and next actions, while the advisor retains the operational workspace.[4]

| Research conclusion | Wendy Collective design decision |
| --- | --- |
| A travel CRM should follow the advisor’s actual journey. [1] | Separate **Pipeline**, **Client Profiles**, **Proposals**, **Group Programs**, and **Experience Library** views. |
| Discovery comes before complex intake and pricing work. [2] | Keep the first public inquiry concise; collect full room and traveler details only after Wendy sends a tailored private link. |
| Proposals should consolidate trip information and a clear decision. [3] | Build each client link from a proposal record, not from a public webpage or a raw form. |
| Client and advisor experiences have different jobs. [4] | Wendy sees notes, tasks, statuses, and supplier information; clients see only the selected ship or trip details, terms, and an approved response form. |

## Diagnosis of the current workspace

The current workspace combines a dashboard, Grimsley profile, generic client form, proposal builder, response inbox, school requests, and experience library in one vertical page. Although all of the pieces are useful, Wendy must scroll to find the next decision. The Grimsley profile also appears visually before the core pipeline and does not surface as a normal active deal within a dedicated pipeline view.

The restart should **retain the secure data and APIs already created**, but replace the workspace presentation and the workflow vocabulary. This is a product redesign, not a data reset. Existing inquiries, cabin requests, private proposal records, and the Grimsley group profile remain valuable records that should be shown through a simpler navigation model.

## Recommended information architecture

The workspace should be an app-like CRM with a narrow left navigation, a compact top bar, and one primary task area. The home screen is not a report. It is Wendy’s working queue.

| Workspace area | Wendy sees | Primary action |
| --- | --- | --- |
| **Today** | Due follow-ups, new inquiries, links awaiting a family response, departures, and recently completed forms. | Open the next most important record. |
| **Pipeline** | A compact list or board of active conversations grouped by stage. Grimsley appears as an active **Group program** card here. | Move a record forward or open its profile. |
| **Clients** | Searchable people and households with contact history, preferences, loyalty numbers, prior trips, and active proposals. | Open or create a client profile. |
| **Trips and groups** | Active individual journeys and hosted groups, each with a simple status and date. | Open a trip or group profile. |
| **Proposals** | Draft, shared, viewed, responded, quote ready, and closed proposals. | Create, revise, pause, copy, or revoke a client link. |
| **Library** | Reusable cruise, resort, and itinerary content. This is reference material, not a client record. | Add or update approved ship and experience content. |

The first release should use this exact separation. No full-page forms on the home screen. New items open in a focused panel or dedicated route, not as another section beneath the dashboard.

## One data model, two booking paths

Every client interaction starts as a **lead** and becomes a **trip** or **group program** after Wendy qualifies it. The difference is the pricing and availability model, not the basic CRM structure.

| Item | Normal tailored booking | Locked group program or deal |
| --- | --- | --- |
| Public entry | Short “Plan your journey” inquiry. | Public deal or shareable group landing page with a clear interest action. |
| Wendy’s next step | Discovery call and supplier research. | Confirm the group program is active and its terms are current. |
| Price shown publicly | Usually none. Wendy can state that final prices vary by traveler and current availability. | Only a verified group rate, its conditions, and the availability window. Never a rate that Wendy has not confirmed is active. |
| Client link | Tailored proposal with selected ship, dates, cabin options, and approved quote context. | Family response link for the specific group program, such as Grimsley. |
| Intake after the link | Traveler information and preference form after Wendy has selected the relevant options. | Room count, cabin category, forward or mid ship or aft preference, named travelers, ages or date of birth where required, and loyalty membership number. |
| Booking | Wendy verifies the live quote in the authorized supplier or host-agency system and personally confirms booking. | Wendy confirms cabin allocation, group rate availability, deposit, and booking through the authorized supplier or host-agency system. |

## Recommended lifecycle

### Individual trip lifecycle

1. **New inquiry**: a visitor submits a concise public inquiry.
2. **Contact scheduled**: Wendy has an outreach task and proposed discovery time.
3. **Discovery complete**: Wendy records dates, budget comfort, decision makers, cruise line or destination direction, and deal-breakers.
4. **Proposal preparation**: Wendy selects approved experience content from the library and adds client-specific options.
5. **Proposal shared**: Wendy sends an opaque, private link by email or text. The client sees no private notes or supplier credentials.
6. **Client response**: the client chooses an option or submits traveler and room details.
7. **Live quote**: Wendy checks current supplier availability and creates or updates the quote.
8. **Ready to book**: Wendy has explicit client approval and follows the authorized payment or card-authorization process outside this application.
9. **Booked**: Wendy records the supplier confirmation reference, deposit and balance milestones, and travel-support tasks.
10. **Travelling and follow up**: task checklist for pre-departure, in-trip, return, and real-feedback follow-up.

### Group program lifecycle

1. **Group setup**: organizer, contract status, travel dates, ship, group rate terms, room block, deadline, and program assets are entered by Wendy.
2. **Family proposal preparation**: the group-specific page is completed with a hero image, itinerary, approved cabin guidance, room strategy, and terms.
3. **Ready to share**: a simple required-fields checklist is complete. Only then can Wendy activate a private family link.
4. **Family details received**: each household’s room and traveler form appears in the Grimsley profile, grouped by household with a single response status.
5. **Live quote and allocation**: Wendy checks the actual group inventory and contact details in the authorized supplier or host-agency system.
6. **Booking in progress**: a family is manually confirmed, waiting on a deposit, or needs follow-up.
7. **Booked**: Wendy saves the confirmation reference, deposit date, balance date, and notes without storing payment-card data.
8. **Travel support**: documents, reminders, and pre-departure tasks remain in the group profile.

## Grimsley as the pilot

Grimsley should be the first record in **Trips and groups** and one card in the active **Pipeline**. Clicking it should open a dedicated group profile with tabs, not a large page below the dashboard.

| Grimsley profile tab | Information and actions |
| --- | --- |
| **Overview** | Mardi Gras image, dates, itinerary, group stage, room-block summary, coordinator, booking deadline, and the next required action. |
| **Families** | One row per household. Each row shows request status, room count, traveler count, location preference, last response, and a link to the detailed submission. |
| **Proposal** | Client-safe content only: hero image, itinerary, room categories, current group-rate language if Wendy has approved it, what is included, terms, and request form. Wendy can preview, share, pause, or renew the private link. |
| **Operations** | Private notes, supplier and group reference numbers, booking deadlines, room-allocation notes, and checklist. |
| **Activity** | Automatic timestamped events: inquiry received, link activated, form submitted, quote reviewed, booking marked confirmed. |

The Grimsley card should show a small **Group program** label, current stage, next action, and family-response count. It should look no more prominent than other active deals; the CRM should still lead with the pipeline and work queue.

## Private proposal-link design

Each private link should use one flexible template, then receive content from its selected trip or group record. The private page should feel like a polished Wendy Collective proposal rather than an internal form.

| Proposal component | Individual client | Group family |
| --- | --- | --- |
| Hero | Selected hotel, ship, or destination image. | Ship image and group name. |
| Summary | Client-specific trip vision, dates, selected options. | Group sailing dates, itinerary, and approved program overview. |
| Options | Up to three Wendy-selected options where comparison is helpful. | Eligible cabin categories and location preference choices. |
| Pricing | Only when Wendy has entered an approved current quote. | Only when the group-rate record is marked current. |
| Request form | Traveler and room preferences when requested by Wendy. | Room count, occupancy, traveler details, preference, loyalty number, and consent. |
| Clear outcome | “Wendy will confirm the live quote before booking.” | “This request does not hold a cabin. Wendy will confirm the group inventory and next steps.” |

Every link should be opaque, revocable, time-limited, `noindex`, and connected to exactly one proposal or group program. A draft link must remain inaccessible until Wendy explicitly marks it shared. Wendy should not send raw database URLs or public admin URLs.

## What is deliberately out of scope for the first rebuild

This portal should **not** become a full online booking engine in its first version. It should not store payment-card data, passport scans, password credentials, or supplier login credentials. It should not publish unverified changing prices. It should not automatically book a traveler or promise cabin placement. The actual live booking and payment process remains within Wendy’s authorized host-agency or supplier workflow.

| Approach | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- |
| **Recommended: Human-led CRM first** | Wendy checks live rates and completes bookings manually, but retains control and avoids integration risk. | Included in the current site. | Low. |
| **Future: Authorized supplier or host-agency connection** | Can reduce duplicate entry, but only works if the provider grants an approved API or export method. It requires credentials, security review, and ongoing support. | Depends on provider terms. | High. |
| **Future: Payment collection in the client link** | Can reduce payment follow-up, but requires a compliant processor, clear authorization flow, and strict data boundaries. | Processor fees apply. | Medium to high. |

## Recommended implementation sequence after approval

1. **Rebuild the internal navigation and shell first.** Replace the long workspace with a compact left navigation and separate routes for Today, Pipeline, Clients, Trips and groups, Proposals, and Library.
2. **Create the Pipeline view.** Use six concise visible columns or filtered list views: New, Discovery, Proposal preparation, Proposal shared, Live quote, and Booked. Do not show completed travel or archived records by default.
3. **Create client and group profile routes.** Move the current Grimsley block into its own profile with Overview, Families, Proposal, Operations, and Activity tabs.
4. **Move proposal building into a focused builder.** Start from an existing client or group, choose an experience template, review client-safe content, then enable the private link deliberately.
5. **Keep the client response flow.** Reuse the secure room and traveler form, but render it only from the tailored link and connect submissions to the correct profile.
6. **Run Grimsley as the pilot.** Enter its confirmed coordinator, group terms, cabin strategy, active booking window, and current rate policy. Then share the private family link only when Wendy confirms the record is ready.
7. **Add integrations later.** First activate the existing email alert capability. Evaluate supplier data or booking integration only after Wendy obtains authorization and confirms what the host agency permits.

## Decisions Wendy needs to make before the rebuild

| Decision | Why it matters |
| --- | --- |
| Does every inquiry require a discovery call, or can repeat clients skip to proposal preparation? | Determines default pipeline stages and first-screen actions. |
| Which group details are mandatory before a family link can be shared? | Defines the readiness checklist. Recommended minimum: coordinator, ship, dates, itinerary, room strategy, terms, and booking window. |
| When may a price appear in a client link? | Keeps variable quotes and locked group-rate messaging separate. |
| Where will Wendy send links: email, text, or both? | Determines the next notification integration after the CRM redesign. |
| Which data remains in the authorized booking platform? | Keeps payment, passport, and supplier-account data out of this website. |

## References

[1]: https://www.foratravel.com/join/resources/travel-agent-crm "Fora: Travel Agent CRM: How to Set It Up & When You Need It"

[2]: https://travefy.com/blog-post/travel-agent-sales-workflow "Travefy: The Travel Agent Sales Workflow That Turns Leads Into Loyal Clients"

[3]: https://travefy.com/blog-post/travel-proposal "Travefy: How Travel Agents Create Professional Proposals and Reduce Back-and-Forth"

[4]: https://journeyfuse.com/client-portal-travel-agents "JourneyFuse: Client Portal for Travel Agents"
