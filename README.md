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
