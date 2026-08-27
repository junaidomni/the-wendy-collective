# SEO and Local Discovery Readiness

## Current State

The Wendy Collective now serves its public marketing pages as **server-rendered HTML**. Search engines and social crawlers receive the destination, FAQ, About, contact, and privacy page text and metadata in the initial response rather than an empty client-side application shell. This is an important foundation because crawler-visible body content, one canonical URL, and route-specific title and description metadata are present before browser JavaScript loads.

| SEO foundation | Current implementation | Validation |
| --- | --- | --- |
| Crawlable public content | Server-rendered HTML for 11 public routes | Production response check returned a body for every public page. |
| Page titles and descriptions | Unique, destination-specific title and description for each public route | Production crawl check confirmed distinct titles. |
| Canonical URLs | Exactly one canonical tag per public page | Production crawl check confirmed one canonical tag on every public route. |
| Social previews | Open Graph and Twitter image, title, description, and URL metadata | Emitted by the server with the existing TWC social image. |
| Structured data | `TravelAgency` JSON-LD with business name, website, description, and social image | Included in the server-rendered HTML. |
| Sitemap and crawler instructions | Public XML sitemap and robots file, excluding Wendy’s workspace | Sitemap has 11 public URLs and robots disallows `/wendy`. |
| Private workspace | `noindex, follow` server response | Production crawl check confirmed noindex on `/wendy`. |
| Missing pages | Real HTTP 404 response | Production crawl check confirmed a 404 for an unknown path. |

Google’s sitemap guidance recommends listing the canonical URLs to be indexed, and Google’s indexing documentation treats sitemap submission as a way to make those URLs easier to discover. [1] The current sitemap includes the homepage, About, five destination guides, FAQ, contact, and privacy policy. [2]

## What Still Requires Final Business Information

The current public domain is the project’s temporary Manus domain. When the final customer-facing domain is connected, update `CANONICAL_ORIGIN` and the sitemap origin to that final HTTPS domain. Then add the site to Google Search Console and submit `/sitemap.xml`. Search Console verification can also support faster business-profile verification in some cases. [3]

Do not add location pages, service-area statements, business phone numbers, credentials, award claims, review markup, or business schema fields until Wendy approves the exact information. Accurate and consistent business information is important for a Google Business Profile and prevents misleading local-search signals. [4]

## Recommended Google Business Profile Decision

Create a Google Business Profile once Wendy has her final business identity information. It is a free managed listing for Google Search and Maps, useful for an advisor operating as a service business. Google allows service businesses to define their service areas even if they do not run a customer-facing storefront. [5]

The first setup session should use Wendy’s own Google account, the precise public business name **The Wendy Collective**, the final business phone number, the final website domain, accurate operating hours, and a truthful service area. Google selects the available verification method based on the business and account; do not create duplicate profiles or use a made-up address. [6]

## References

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central: Build and submit a sitemap"
[2]: https://support.google.com/webmasters/answer/183668?hl=en "Google Search Console: Manage your sitemaps"
[3]: https://support.google.com/business/answer/7107242?hl=en "Google Business Profile: Verify your business"
[4]: https://support.google.com/business/answer/3038177?hl=en "Google Business Profile: Guidelines for representing your business"
[5]: https://business.google.com/us/business-profile/ "Google Business Profile"
[6]: https://support.google.com/business/answer/145585?hl=en "Google Business Profile: Find your business on Google"
