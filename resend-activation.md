# Resend Activation Guide

## What Is Already Ready

The website now stores every trip brief in Wendy’s protected workspace, sends the existing project-owner alert, and is prepared to send a branded Resend email for every new brief. The Resend email is intentionally inactive until all three production values are provided. No traveler inquiry will fail merely because those values are still missing.

| Required value | Format | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_...` | Authenticates secure server-side delivery with Resend. |
| `RESEND_FROM_EMAIL` | `The Wendy Collective <hello@your-domain.com>` | The verified sending identity shown in Wendy’s inbox. |
| `RESEND_ALERT_RECIPIENT` | `wendy@your-domain.com` | The inbox that receives each new trip brief. |

## One Time Setup

First, create Wendy’s Resend account and add the domain that will be used in the sender email. Resend will show DNS records that must be added where the domain is managed. Resend requires verification of a domain you own for production sending and recommends a dedicated sending subdomain such as `mail.thewendycollective.com` to separate email reputation from the main website. [1]

Next, create a restricted Resend API key for this website. Add the API key, sender address, and Wendy’s alert email through the secure project settings when they are available. The website will immediately begin sending a branded HTML and plain-text email to Wendy on each new trip brief. The traveler’s email is placed in the Reply To field, so Wendy can respond directly from the alert.

## Delivery Safeguards

Each trip brief uses its stored record ID as an idempotency key. This prevents accidental duplicate emails if the same delivery request is retried. The email includes the traveler’s name, email, phone number, trip style, destinations, timing, budget, traveler count, and planning notes. [2]

The existing owner alert remains active as a backup notification route. If Resend is not configured, the trip brief still stores successfully and appears in Wendy’s workspace. If the email service later reports a delivery problem, the inquiry is still retained in the secure workspace for follow-up.

## After Activation

Submit one real trip brief using a real email address, verify that the alert arrives in Wendy’s inbox, confirm that Reply To addresses the traveler, and review the same record in the footer-only Wendy workspace. If the final public domain changes, update the sender address and the site canonical URLs together.

## References

[1]: https://resend.com/docs/dashboard/domains/introduction "Resend: Verified Domains"
[2]: https://resend.com/docs/api-reference/emails/send-email "Resend: Send Email"
