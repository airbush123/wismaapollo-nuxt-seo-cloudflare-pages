# Wisma Apollo Nuxt SEO Cloudflare Pages

Open-source Nuxt and Cloudflare Pages website implementation focused on technical SEO, multilingual routing, structured data, tracking integrations, and high Lighthouse/PageSpeed scores for a real local business website.

This repository uses Wisma Apollo Kuala Kurun as a production case study for building a fast static website that can still support real marketing and analytics needs such as Google Tag Manager, Meta Pixel/CAPI-friendly tracking, schema.org data, canonical URLs, hreflang, sitemap generation, and multilingual pages.

## Why This Project Exists

Small business websites often need both marketing integrations and strong performance. Adding analytics, tracking snippets, multilingual pages, schema, and booking flows can easily damage Core Web Vitals or create SEO issues.

This project documents a practical Nuxt implementation that aims to keep the site fast, crawlable, and maintainable while still supporting real-world business requirements.

## Key Goals

- Maintain near-perfect Lighthouse/PageSpeed scores.
- Generate static output for Cloudflare Pages.
- Keep canonical URLs, trailing slashes, and sitemap entries consistent.
- Support partial multilingual SEO with Indonesian and English pages, plus selected Chinese pages.
- Add structured data for `Organization`, `Hotel`, `WebSite`, `WebPage`, `BreadcrumbList`, `FAQPage`, and `BlogPosting`.
- Keep internal links, breadcrumbs, schema, and sitemap aligned.
- Provide practical examples for GTM, Meta Pixel/CAPI-style event tracking, booking forms, and SEO landing pages.
- Collect booking leads through a Google Apps Script webhook into Google Sheets without blocking the WhatsApp reservation flow.
- Support first-party Cloudflare Pages Functions for tracking, lead forwarding, and GTM proxy patterns.

## Lightweight Backend and Lead Collection

This project keeps the public website static, but still includes a lightweight backend flow for real booking leads.

The reservation form is handled in the Nuxt app through the booking store. After the guest fills the modal, the site sends the lead to `/api/webhook`. Nuxt route rules proxy that endpoint to a Google Apps Script webhook, and the Apps Script writes the submitted data into Google Sheets.

The lead submission is best-effort by design. If the webhook or network is slow, the guest is not blocked from continuing to WhatsApp. This keeps the booking funnel fast while still collecting structured lead data for follow-up and ad attribution.

Booking lead flow:

```text
Reservation modal
  -> Nuxt Pinia booking store
  -> /api/webhook
  -> Google Apps Script webhook
  -> Google Sheets lead table
  -> WhatsApp reservation handoff
```

Related documentation:

- `docs/google-sheet-webhook-columns.md` documents the fields sent to Google Sheets.
- `docs/website-tree-and-spec.md` documents the full website tree, booking flow, tracking flow, and SEO structure.
- `docs/gtm-wisma-apollo.md` documents the GTM and tracking setup.

## Cloudflare Pages Functions

The repository also includes Cloudflare Pages Functions under `functions/` for first-party backend patterns:

- `functions/api/booking-event.js` receives booking/tracking events and forwards Meta CAPI events.
- `functions/api/booking-lead.js` is an alternative lead endpoint that forwards booking data to Google Apps Script and sends a Meta CAPI `Lead` event.
- `functions/api/meta-capi.js` exposes a direct Meta CAPI endpoint wrapper.
- `functions/px/gtm/[file].js` proxies the GTM script through a first-party path.

The current frontend booking flow uses the Nuxt `/api/webhook` proxy to Google Apps Script. The Cloudflare `booking-lead` function is included as a documented alternative if the project needs one combined endpoint for Google Sheets and Meta CAPI lead tracking.

## Stack

- Nuxt 4
- Vue
- Nuxt Content
- Nuxt Image
- Nuxt i18n
- Nuxt Sitemap
- Pinia
- Cloudflare Pages

## SEO Features

- Static sitemap index with locale-specific sitemap files.
- Canonical URLs with trailing slash normalization.
- Dynamic hreflang for partial multilingual pages.
- Schema.org graph output for homepage, landing pages, FAQ, and blog articles.
- Local business NAP consistency in page content and structured data.
- Blog content with author, published date, modified date, image, and article schema.
- Internal linking for local SEO keyword clusters such as hotel, lodging, guest house, homestay, staycation, and rest place searches.

## Performance Notes

- Static generation for Cloudflare Pages.
- Responsive image optimization via Nuxt Image.
- Reduced layout shift with stable image dimensions and UI constraints.
- Tracking code is handled through project utilities instead of scattered inline scripts.
- Build output is audited for canonical, sitemap, hreflang, and page metadata consistency.

## Repository Structure

```text
nuxt-app/
  app/
    components/
    composables/
    pages/
    schemas/
    stores/
  content/
    id/blog/
    en/blog/
  locales/
  server/plugins/
```

## Local Development

```bash
cd nuxt-app
npm install
npm run dev
```

The dev server uses port `9000`.

## Static Generation

```bash
cd nuxt-app
npm run generate
```

The static output is generated in:

```text
nuxt-app/.output/public
```

## Cloudflare Pages

Recommended build command:

```bash
npm ci --prefix nuxt-app && npm run generate --prefix nuxt-app
```

Recommended output directory:

```text
nuxt-app/.output/public
```

## License

MIT
