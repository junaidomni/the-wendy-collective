# Wendy CRM Stage Gated Workflow Blueprint

## Recommendation

The portal should work as a **guided client record**, not as an editable page with a stage dropdown. Each client or group has one current stage, a visible journey rail, completed stages that preserve their record, and one clear action to move forward. A stage view answers four questions: what Wendy needs to know now, what she needs to do now, what is already confirmed, and what must be complete before the next step opens.

This mirrors the useful parts of modern CRM practice. Salesforce recommends defining specific exit criteria for each pipeline stage, rather than treating stages as general labels.[1] TravelJoy similarly separates trip stages, reusable templates, task lists, forms, and client facing proposals, with work organized around each trip.[2][3] For a group program, centralized traveler and room information is particularly important because requests, preferences, and communications otherwise fragment across emails and spreadsheets.[4]

> **Design principle:** A record can move forward only through a deliberate **Continue to next stage** action. The server validates the current stage requirements, writes a dated history event, and opens the next focused work area. Future stages are locked. Completed stages remain readable and may be reopened only with a reason.

## Information Architecture

| CRM location | Purpose | What Wendy sees first |
| --- | --- | --- |
| **Today** | A work queue, not a report | Due today, overdue follow ups, meetings, unsent proposals, new family responses |
| **Pipeline** | One visual board and separate stage views | Counts and active cards by stage; every stage is clickable |
| **Clients** | Individual traveler records | Open client profile, current stage, next action, active trip |
| **Trips and Groups** | Hosted trips, school programs, reunions, weddings, and group cruises | Group program cards such as Grimsley, current stage, coordinator, family count |
| **Proposals** | Draft and shared client proposals | Drafts needing completion, shared links, response status, expiry |
| **Library** | Reusable reviewed content | Ships, sailings, room categories, property details, images, itinerary blocks, add ons |

The **Pipeline** should be the operational entry. A stage card opens a filtered stage view. Selecting a record then opens a dedicated profile. The profile never becomes one long dashboard: it opens the current stage by default and puts history, profile facts, documents, and past stages behind focused tabs.

## Shared Stage Model

All individual and group records use the same journey so Wendy learns one flow. The content inside a stage differs for an individual trip versus a group program.

| Order | Stage | Purpose | Primary next action |
| --- | --- | --- | --- |
| 1 | **New inquiry** | Capture who contacted Wendy and why | Respond and schedule discovery |
| 2 | **Discovery scheduled** | Prepare for the conversation and capture its outcome | Complete discovery |
| 3 | **Proposal build** | Select reviewed travel content and shape the recommendation | Finalize proposal |
| 4 | **Proposal shared** | Track the active private link and client questions | Review client response |
| 5 | **Family details** | Collect and review party, rooms, preferences, and required traveler details | Verify booking request |
| 6 | **Live quote** | Wendy checks current supplier price and availability outside the portal | Record approved live quote |
| 7 | **Booking** | Wendy makes the booking in her authorized supplier system | Record confirmation |
| 8 | **Booked** | Maintain confirmations, milestones, final itinerary, and support tasks | Manage travel care |
| 9 | **Closed** | Archive a completed, cancelled, or deferred opportunity with the reason | Reopen only when appropriate |

This does **not** mean each record has nine different pages filled with redundant data. The profile has a single reusable layout and shows one focused stage workspace at a time. The journey rail records progress, while the client profile holds shared facts such as name, contact information, party size, and travel dates.

## Layout for Every Client or Group Profile

The client profile should use the same steady structure on every stage.

1. **Profile header.** Client or group name, travel type, current stage, owner, due next action, and a compact contact summary. For Grimsley, this header also shows the ship, sailing date, coordinator, and family count.
2. **Journey rail.** A horizontal numbered sequence on desktop and a compact vertical sequence on mobile. Completed stages are selectable for review, the current stage is expanded, and future stages are visibly locked.
3. **Current stage workspace.** One strong left column for required inputs and tasks, with a right side **Stage checklist** showing what is complete and what blocks progression.
4. **Record side panel.** Collapsible profile details, recent activity, notes, and related files. It is available without burying the stage workspace in a wall of fields.
5. **Footer action bar.** Save draft, save and continue, or reopen a prior stage. A free stage selector does not appear in the everyday interface.

## Stage Workspaces and Gates

### 1. New inquiry

The first screen should be short and operational. It shows the submitted inquiry, source, client contact information, travel objective, desired timing, party size, budget cue, and the date received. Wendy records a first response and chooses a discovery time.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Valid contact method; travel reason; next action; discovery date or a documented reason that discovery is not needed | Inquiry source; original request; preferred contact method; initial budget and dates | **Schedule discovery** |

The completion event saves the initial request unchanged, writes an activity event, and opens **Discovery scheduled**. This protects the original client voice while Wendy adds better detail later.

### 2. Discovery scheduled

This is a meeting preparation and outcome workspace, not merely a calendar date. Before the call, Wendy sees the original inquiry and a short agenda. After the call, she records priorities, nonnegotiables, destinations or ship interests, departure window, traveler needs, room strategy, budget range, and decision timing.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Call outcome; date range; party composition; budget direction; priorities; a next step | Meeting date; agenda; notes; client preferences; advisor assessment | **Complete discovery** |

If the client is not ready, Wendy can set a future follow up and keep the record in this stage. The record only progresses when Wendy has enough direction to begin research.

### 3. Proposal build

This stage is the advisor’s design desk. Wendy chooses a reusable ship, sailing, destination, hotel, or itinerary block from the **Library**, then tailors it to the record. She can add a cover image, itinerary, room categories, placement guidance, included and excluded items, amenities, change and cancellation notes, a live quote date, and advisor notes. For a group, she also sets the group terms, family request window, coordinator details, and room strategy.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Client safe title; at least one reviewed option; current content source; visible inclusions and exclusions; response deadline; client action requested | Proposal draft version; cover image; ship and itinerary; categories; terms; internal notes | **Preview and mark ready to share** |

The stage uses a **Proposal readiness checklist**, not a generic form. Wendy can save a draft freely. Only a completed checklist enables the share action. Proposal records should be versioned, so a changed sailing or room price creates a new version rather than silently changing a previously shared client view.

### 4. Proposal shared

This stage centers on the link, not on proposal authoring. It shows link state, first opened date when tracking is later enabled, expiry, latest version, sent date, reminder status, client questions, and a simple response indicator. The page has actions to copy the link, revoke it, create a revised version, or move the record back to Proposal build.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| An active shared proposal version; a documented client response or an intentional follow up task | Link audit events; response date; client questions; version shared | **Review family details** |

For a group, this is when the coordinator receives a branded share page and families receive a secure custom link. The link should show only client safe information. Draft links remain inaccessible and private proposal URLs stay noindex.

### 5. Family details

This is the dedicated intake and review stage. A client fills out rooms, traveler names, date of birth when needed for quote preparation, cabin preference, forward or mid ship or aft preference, loyalty number, amenities, special requests, and opt in communication preference. Wendy sees one family card per submission inside the group or client profile.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Wendy has reviewed the received request; selected room needs are clear; any missing details are assigned as a follow up | Every form version; submitted rooms; traveler details; amenities; response status; advisor notes | **Request live quote** |

Passport documents, payment cards, and supplier portal credentials do not belong in this stage. Those actions occur in the appropriate authorized provider system or later secure service.[5]

### 6. Live quote

This is a **verification** stage. Wendy uses Carnival, Royal Caribbean, Norwegian, IntelliTravel, or another authorized advisor portal outside the Wendy site to verify live availability, final room placement, actual price, deposit, deadlines, taxes, policies, and provider confirmation terms. She records the quote reference, source, validity deadline, confirmed room category, final amount, and client acceptance status.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Verified source; quote reference; quote expiry; final amount; confirmed room and placement; client approval record | Quote snapshot; supplier notes; price changes; approval timestamp | **Proceed to booking** |

The portal must never imply that an online request holds inventory or guarantees price. The visible client language stays clear: Wendy will verify the live quote personally.

### 7. Booking

Wendy completes the actual booking in an authorized supplier workflow. The CRM then captures confirmation number, booking date, supplier, deposit schedule, booking owner, next payment date, and any required client follow up. It may later link to a compliant payment or document platform, but it does not store raw card data or passport scans itself.

| Required to continue | Saved for later stages | Primary action |
| --- | --- | --- |
| Confirmation reference; booked traveler and room match; next deadline; client confirmation sent | Booking record; payment schedule summary; supplier confirmation reference; advisor task list | **Mark booked** |

### 8. Booked

This is Wendy’s travel care workspace. It presents payment checkpoints, room assignment updates, final itinerary, travel documents, transfer notes, pre departure communications, and a scheduled check in. The client sees a polished final itinerary or portal. Wendy sees operational tasks and supplier references.

### 9. Closed

Closing preserves the record. Wendy selects **booked elsewhere**, **not proceeding**, **future follow up**, **duplicate**, or **cancelled**, and records a short reason. Closed records remain searchable and can be reopened, but reopening is an explicit logged action rather than a casual dropdown change.

## Stage Transition Rules

| Rule | Recommendation |
| --- | --- |
| **Forward motion** | Only allow one next stage at a time through a labeled action such as “Complete discovery” or “Mark ready to share.” |
| **Prerequisite validation** | Validate required facts server side, then show a readable list of what is missing. The browser alone must not decide whether a stage can advance. |
| **History** | Write an immutable transition event with date, Wendy, old stage, new stage, checklist result, and reason where relevant. |
| **Prior stage changes** | Allow **Reopen discovery** or **Reopen proposal**, not a free dropdown. Ask for reason and mark later proposal or quote information as needing review. |
| **Proposal versioning** | A shared proposal is frozen as Version 1. Revisions create Version 2 and revoke or supersede Version 1 as Wendy chooses. |
| **Group relationship** | A group record owns shared program facts. Each family response is a subrecord with its own review state, but never creates a separate unconnected group. |
| **Today queue** | Generate work items from next actions, appointment times, proposal expiry, family responses, live quote expiry, and payment deadlines. |

## Individual Trips and Group Programs

The stage engine is shared. The screens differ where the business requires it.

| Area | Individual trip | Group program such as Grimsley |
| --- | --- | --- |
| Record owner | One household or lead traveler | School coordinator plus many participating households |
| Proposal | Curated options for one party | One approved group program with family safe options and group terms |
| Client link | One household link | Coordinator share page plus secure family response links |
| Family details | One party’s travelers and rooms | Response inbox organized by household, room, and traveler |
| Live quote | One verified quote | Quote verification per family or room allocation, with group terms retained |
| Booked | One confirmation and milestones | Group overview plus separate family confirmation references |

## What Changes in the Current Portal

The current stage dropdown should be removed from the daily profile. The new profile experience should open to **New inquiry** and show a numbered rail. The primary button becomes **Respond and schedule discovery**. After that data is saved, the next stage unlocks. The current workspace remains available as the record side panel and activity history, but it no longer presents all operational fields at once.

Grimsley becomes an example of the group version of this architecture. Its Groups profile should be on **Proposal build** only until Wendy completes the group terms, school coordinator, room strategy, reviewed ship facts, response window, and proposal cover. Then **Mark ready to share** unlocks. A share action creates a private, branded family link from the approved proposal version. Family responses populate the **Family details** stage, not a disconnected inbox.

## Implementation Sequence

| Release | Scope | Why it comes first |
| --- | --- | --- |
| **1. Stage engine** | Server validated next and reopen actions, stage history, checklists, journey rail | Prevents the weak free-form dropdown from returning |
| **2. Client profile flow** | New inquiry, Discovery scheduled, Proposal build, Proposal shared | Makes normal inquiries usable immediately |
| **3. Proposal versioning** | Draft, preview, approve, share, revoke, expiration, copy link | Makes private links tailored and auditable |
| **4. Group flow** | Group program profile, coordinator, group terms, family inbox, response review | Moves Grimsley onto the same architecture |
| **5. Quote and booking operations** | Verified quote snapshot, confirmation, tasks, payment deadlines | Preserves manual supplier booking while centralizing work |
| **6. Automation and approved integrations** | Resend notifications, calendar sync, supplier data access after authorization | Adds convenience without making the system unsafe or brittle |

## Initial Decisions for Wendy

The following choices can be set as defaults now and adjusted after she uses the flow with a few real records.

| Decision | Recommended default |
| --- | --- |
| Stage naming | Use the nine names in this blueprint, with clear client friendly labels in private links |
| Stage advancement | Forward only, one stage at a time, server validated |
| Reopening a stage | Allowed to Wendy only, with a required reason and activity entry |
| Proposal expiry | 30 days by default with a separate 60 day option for groups; shorter quote expiry may be recorded within a proposal |
| Family detail collection | Request rooms, traveler legal names, optional date of birth, loyalty numbers, preferences, and special needs; exclude passports and payment cards |
| Supplier verification | Wendy verifies quotes in authorized supplier or host systems and records the quote snapshot in this CRM |
| Notifications | Send Wendy an email when a private proposal is opened or a family response is received after Resend is activated |

## References

[1]: https://www.salesforce.com/sales/pipeline/management/ "Salesforce: Sales Pipeline Management"
[2]: https://help.traveljoy.com/hc/en-us/articles/9335768898836-Step-2-Optimize-your-workflow "TravelJoy: Optimize Your Workflow"
[3]: https://help.traveljoy.com/hc/en-us/articles/4407244320532-Create-an-Itinerary-or-Smart-proposal "TravelJoy: Create an Itinerary or Smart Proposal"
[4]: https://traveljoy.com/blog/post/how-to-plan-group-trips-efficiently-as-a-travel-advisor "TravelJoy: How to Plan Group Trips Efficiently"
[5]: https://help.traveljoy.com/hc/en-us/articles/360016089572-PROTIP-Combine-multiple-forms-to-simplify-communication "TravelJoy: Combine Multiple Forms"
