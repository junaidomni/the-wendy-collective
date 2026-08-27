# Email and SEO Implementation Notes

## Resend Transactional Alerts

The official Resend API requires a sender address, recipient address, subject, and message content. It supports both HTML and plain text messages, a reply-to address, and an idempotency key that prevents duplicate sends for 24 hours. The prepared implementation uses the stored trip-brief ID as the idempotency key and sets the traveler’s email as the reply-to address. [1]

Resend requires a domain the sender owns and verifies before production sending. Its current guidance recommends a dedicated subdomain for sending so transactional reputation is isolated from other uses of the domain. [2]

## Indexing and Canonical URLs

Google recommends an XML sitemap at the website root with fully qualified canonical URLs. Sitemap inclusion and a self-referential canonical link work together as signals of the preferred public URL. [3] [4]

The `robots.txt` file manages crawler access but should not be relied on to keep a page private. Sensitive pages should use access controls or explicit noindex behavior. The Wendy workspace is access-controlled and will also receive a noindex directive. [5]

## References

[1]: https://resend.com/docs/api-reference/emails/send-email "Resend: Send Email"
[2]: https://resend.com/docs/dashboard/domains/introduction "Resend: Verified Domains"
[3]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central: Build and submit a sitemap"
[4]: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls "Google Search Central: Canonical URLs"
[5]: https://developers.google.com/search/docs/crawling-indexing/robots/intro "Google Search Central: robots.txt"
