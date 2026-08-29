# Wendy Collective CRM and Proposal Pipeline

## Purpose

The first release is an advisor-led workspace, not an automatic booking engine. Wendy owns the journey from first inquiry through confirmed reservation, and travelers receive only the information needed to review a proposal and request the next conversation.

## Core records

| Record | Purpose | Private data boundary |
| --- | --- | --- |
| Lead | A first contact received through the existing trip brief or a school cabin request. | Contact details are visible only to Wendy. |
| Deal | Wendy’s working record for a specific household or organizer after discovery. | Notes, quote history, and reservation reference remain Wendy-only. |
| Cruise experience | Reusable ship and itinerary reference selected by Wendy when building a proposal. | Contains approved public content, images, room guidance, and no live inventory promise. |
| Proposal | A tailored shareable package connected to one deal and one experience. | Private access uses an opaque, revocable link token. |
| Client response | A traveler’s requested rooms and traveler details submitted from a proposal link. | Collects only the minimum contact and traveler data needed for Wendy to prepare a live quote. |

## Deal stages

The dashboard will use the following sequence: **New inquiry**, **Discovery call**, **Building proposal**, **Proposal shared**, **Ready to book**, **Booked**, and **Closed**. A stage records Wendy’s current action, rather than implying a supplier confirmation or automatic reservation.

## First release boundaries

The client link will be a noindex page with a private, unguessable token. It will allow the household to see an approved proposal, select room needs, and share traveler details. It will clearly state that prices and availability must be confirmed by Wendy before booking. It will not collect payment-card numbers, passport information, account passwords, medical information, or supplier login credentials.

## Provider integrations

IntelliTravel, Carnival, and other supplier connections are deferred until Wendy supplies authorized access and the provider’s supported integration method. The first release is designed for Wendy to use current supplier data manually in the workspace. This avoids presenting stale prices or unmanaged inventory as bookable.

## Initial migration path

The new reusable deal records will coexist with the existing trip briefs and Grimsley cabin-request tables. The Grimsley experience becomes the first reusable cruise experience and the existing school requests remain visible to Wendy while the general proposal workflow is introduced.
