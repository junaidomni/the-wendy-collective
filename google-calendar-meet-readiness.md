# Google Calendar and Meet Readiness

## Current local workflow

Wendy can now schedule discovery calls and save availability blocks inside the protected CRM. Each local appointment retains the client name, contact details, scheduled time, duration, prepared client message, advisor notes, and the next action. The Calendar workspace is the operational source of truth until an approved external calendar connection is activated.

No Google Calendar event, Google Meet link, client invitation, or external email is created by the current version. Every locally saved appointment carries the integration state `not_connected` so Wendy can distinguish a saved CRM plan from a sent calendar invitation.

## Future activation sequence

| Step | Required before enabling | Result after authorization |
|---|---|---|
| Connect Google account | Wendy authorizes the correct Google account with calendar event access | The system can read and create events for that authorized calendar |
| Confirm invitation policy | Wendy chooses the calendar, meeting default, event title pattern, and client message | Newly created events can invite the client and optionally request a Google Meet link |
| Activate controlled sync | A server-side Google integration with approved credentials is configured and tested | A local appointment is synced only after a deliberate Wendy action, then stores the returned event ID and Meet URL |
| Add availability sharing | Wendy confirms which local blocks should sync and whether clients may book directly | Availability can be pushed to Google, and public booking can remain a separately approved future feature |

## Safeguards

The future integration must keep each event’s attendee list limited to the confirmed client contacts. It must not send payment, passport, password, supplier-login, or unrelated CRM information to Google. Failed syncs must leave the local appointment intact and clearly mark it for Wendy to retry. Client invitations should be sent only after Wendy deliberately confirms the event details.
