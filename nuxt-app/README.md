# Wisma Apollo Nuxt App

Nuxt application for the Wisma Apollo SEO and Cloudflare Pages case study. The app is built as a static site with multilingual routing, structured data, canonical URLs, hreflang, sitemap generation, optimized images, and marketing tracking utilities.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:9000`:

```bash
npm run dev
```

## Static Generation

Generate the Cloudflare Pages-ready static output:

```bash
npm run generate
```

Generated files are written to:

```text
.output/public
```

## SEO Implementation

- Locale-aware canonical URLs.
- Partial multilingual hreflang strategy.
- Sitemap filtering for Chinese homepage and FAQ only.
- Schema graph for local business, website, pages, breadcrumbs, FAQ, and blog posts.
- Content pages for local search keyword clusters.
- Static HTML links normalized to canonical trailing slash URLs.

## Booking Lead Webhook

The booking form uses the Pinia booking store and submits validated lead data to `/api/webhook`.

In `nuxt.config.ts`, `/api/webhook` is proxied to a Google Apps Script webhook. The Apps Script writes the reservation lead into Google Sheets, so the static Cloudflare Pages site can still collect structured booking inquiries without a traditional database server.

The webhook request is best-effort. If the endpoint is slow or unavailable, the user can still continue to WhatsApp so the reservation flow stays fast.

Related backend and tracking files:

- `../docs/google-sheet-webhook-columns.md` documents the Google Sheets fields.
- `../functions/api/booking-lead.js` provides an alternative Cloudflare Function for forwarding leads to Google Apps Script and Meta CAPI.
- `../functions/api/booking-event.js` handles booking event forwarding for Meta CAPI.
- `../functions/px/gtm/[file].js` proxies GTM through a first-party Cloudflare Pages Function path.
