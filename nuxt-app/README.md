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
