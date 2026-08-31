# Cruise Inventory Access Research

Research date: August 31, 2026

## Verified provider access signals

| Provider | Verified official source | Observed access model | Planning implication |
|---|---|---|---|
| Carnival Cruise Line | [GoCCL Navigator](https://www.goccl.com/) | Carnival presents GoCCL Navigator as a travel-advisor resource with booking tools behind a username and password. | Wendy’s CRM must not scrape or simulate Carnival inventory. Any live sailing or price lookup requires Wendy’s authorized advisor access and a provider-approved integration method. |
| Norwegian Cruise Line | [Norwegian Central](https://norwegiancentral.ncl.com/) | Norwegian Central states it provides tools to learn, promote, and book Norwegian, with sign-in using Book NCL credentials. | Live Norwegian availability belongs behind Wendy’s authorized agency credentials or a formally approved partner route. The CRM should keep only manually verified or authorized-sourced results. |
| InteleTravel | [InteleTravel](https://www2.inteletravel.com/) | The public site routes travelers toward an advisor and identifies partner coverage, but does not expose advisor booking credentials or a documented public inventory API. | InteleTravel should remain Wendy’s operational partner layer. The CRM can prepare search and proposal records now, then add only an approved InteleTravel workflow when Wendy confirms the sanctioned access method. |

## Design conclusion

The site should separate Wendy’s curated internal cruise library from live supplier availability. The internal library stores durable ship and itinerary facts, approved imagery, suitability tags, and source review dates. A later authorized lookup layer can supply time-sensitive sailing options, taxes, inventory, and quotes only after Wendy connects an approved provider account.

Until that connection exists, every private comparison link should present a curated set of named cruise possibilities without fare guarantees. A family selects the option that interests them and supplies rooms, travelers, timing, and preferences. Wendy then performs the live quote and booking through her approved advisor platform.

## Sources

1. [GoCCL Navigator](https://www.goccl.com/), accessed August 31, 2026.
2. [Norwegian Central](https://norwegiancentral.ncl.com/), accessed August 31, 2026.
3. [InteleTravel](https://www2.inteletravel.com/), accessed August 31, 2026.
