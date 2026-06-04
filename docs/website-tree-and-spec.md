# Wisma Apollo Website - Tree dan Spek Teknis

Dokumen ini merangkum struktur project dan spesifikasi website Wisma Apollo berdasarkan isi repo lokal `E:\Documents\Wisma Apollo`.

## Ringkasan

Website ini adalah website hotel/penginapan Wisma Apollo Kuala Kurun. Fokus utamanya adalah SEO lokal, reservasi via WhatsApp, pengumpulan lead ke Google Sheet, tracking iklan Google/Meta, blog artikel, landing page turunan keyword, dan deployment ke Cloudflare Pages.

Versi utama website ada di folder `nuxt-app`. File `index.html`, `index.css`, dan beberapa script di root terlihat sebagai versi statis/legacy atau utility untuk rebuild/recovery konten.

## Stack

- Framework utama: Nuxt 4 / Vue 3
- Rendering: SSR aktif dan bisa digenerate static dengan `nuxt generate`
- State management: Pinia
- Content/blog: `@nuxt/content`
- Image handling: `@nuxt/image`
- I18n: `@nuxtjs/i18n`
- Sitemap: `@nuxtjs/sitemap`
- Validasi form: Zod tersedia, validasi utama booking saat ini juga ditulis di Pinia store
- Hosting/deployment: Cloudflare Pages
- Serverless backend: Cloudflare Pages Functions
- Tracking: Google Tag Manager, Google Ads Enhanced Conversion, Meta Pixel, Meta CAPI
- Lead storage: Google Apps Script webhook ke Google Sheet

## Command Utama

Dari root repo:

```powershell
npm run dev
npm run build
npm run generate
```

Script root menjalankan perintah di `nuxt-app`:

```json
{
  "build": "npm ci --prefix nuxt-app && npm run generate --prefix nuxt-app",
  "dev": "npm ci --prefix nuxt-app && npm run dev --prefix nuxt-app",
  "generate": "npm ci --prefix nuxt-app && npm run generate --prefix nuxt-app"
}
```

Dari `nuxt-app` langsung:

```powershell
npm run dev
npm run build
npm run generate
npm run preview
```

Dev server Nuxt diset ke port `9000`.

## Tree Project Relevan

Tree ini sengaja mengecualikan `.git`, `node-js`, `node_modules`, `.nuxt`, `dist`, dan file report Lighthouse yang besar.

```text
Wisma Apollo/
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- wrangler.toml
|-- wisma-apollo.code-workspace
|-- robots.txt
|-- sitemap.xml
|-- index.html
|-- index.css
|-- index.js
|-- lead_form.js
|-- GTM_Wisma_Apollo_import.json
|-- GTM_Wisma_Apollo_Google_Final_import.json
|-- lighthouse-seo-submenu.json
|-- build_sitemap.js
|-- build_sekolah_rakyat.js
|-- generate_social_posts.js
|-- rebuild_blog_index.js
|-- rebuild_hotel.js
|-- rebuild_hotel2.js
|-- rebuild_hotel_balance.js
|-- rebuild_missing_articles.js
|-- rebuild_seo_articles.js
|-- restore_blog.js
|-- restore_emojis.js
|-- clean_mojibake.js
|-- fix_blogs.js
|-- fix_blog_js.js
|-- fix_air_terjun.js
|-- update_blog_links.js
|-- docs/
|   |-- backoffice-parser-plan.md
|   |-- google-sheet-webhook-columns.md
|   |-- gtm-wisma-apollo.md
|   |-- seo-recovery-manual-checklist.md
|   `-- website-tree-and-spec.md
|-- functions/
|   |-- _middleware.js
|   |-- _meta-capi-core.js
|   |-- api/
|   |   |-- booking-event.js
|   |   |-- booking-lead.js
|   |   `-- meta-capi.js
|   `-- px/
|       `-- gtm/
|           `-- [file].js
`-- nuxt-app/
    |-- package.json
    |-- package-lock.json
    |-- nuxt.config.ts
    |-- content.config.ts
    |-- tsconfig.json
    |-- README.md
    |-- app/
    |   |-- app.vue
    |   |-- assets/
    |   |   `-- css/
    |   |       `-- main.css
    |   |-- layouts/
    |   |   `-- default.vue
    |   |-- pages/
    |   |   |-- index.vue
    |   |   |-- [slug].vue
    |   |   |-- faq.vue
    |   |   |-- thanks.vue
    |   |   `-- blog/
    |   |       |-- index.vue
    |   |       `-- [slug].vue
    |   |-- components/
    |   |   |-- AboutSection.vue
    |   |   |-- AppFooter.vue
    |   |   |-- AppNavbar.vue
    |   |   |-- BookingModal.vue
    |   |   |-- BottomBar.vue
    |   |   |-- FacilitiesSection.vue
    |   |   |-- GallerySection.vue
    |   |   |-- HeroSection.vue
    |   |   |-- LightboxOverlay.vue
    |   |   |-- MapSection.vue
    |   |   |-- PromoStrip.vue
    |   |   |-- RoomCards.vue
    |   |   |-- SkipLink.vue
    |   |   `-- TestimonialSection.vue
    |   |-- composables/
    |   |   |-- useScrollAnimation.ts
    |   |   |-- useSitelinkSchema.ts
    |   |   `-- useTracking.ts
    |   |-- stores/
    |   |   |-- useBookingStore.ts
    |   |   `-- useUIStore.ts
    |   `-- schemas/
    |       `-- booking.ts
    |-- content/
    |   |-- id/
    |   |   `-- blog/
    |   |       |-- 5-cafe-kopi-terbaik-di-kuala-kurun.md
    |   |       |-- air-terjun-batu-mahasur.md
    |   |       |-- batu-suli-desa-upon-batu.md
    |   |       |-- bundaran-kuala-kurun.md
    |   |       |-- hotel-di-kuala-kurun.md
    |   |       |-- hotel-gunung-mas-kalimantan-tengah.md
    |   |       |-- hotel-kuala-kurun-kalimantan-tengah.md
    |   |       |-- kuliner-kuala-kurun.md
    |   |       |-- penginapan-murah-kuala-kurun.md
    |   |       |-- sejarah-hotel-gunung-mas-menjadi-sekolah-rakyat.md
    |   |       |-- tips-menginap-kuala-kurun.md
    |   |       `-- wisata-gunung-mas.md
    |   `-- en/
    |       `-- blog/
    |           |-- 5-cafe-kopi-terbaik-di-kuala-kurun.md
    |           |-- air-terjun-batu-mahasur.md
    |           |-- batu-suli-desa-upon-batu.md
    |           |-- bundaran-kuala-kurun.md
    |           |-- hotel-di-kuala-kurun.md
    |           |-- hotel-kuala-kurun-kalimantan-tengah.md
    |           |-- kuliner-kuala-kurun.md
    |           |-- penginapan-murah-kuala-kurun.md
    |           |-- sejarah-hotel-gunung-mas-menjadi-sekolah-rakyat.md
    |           |-- tips-menginap-kuala-kurun.md
    |           `-- wisata-gunung-mas.md
    |-- locales/
    |   |-- id.json
    |   |-- en.json
    |   `-- zh.json
    |-- i18n/
    |   `-- locales/
    |       |-- id.json
    |       `-- en.json
    `-- public/
        |-- favicon.ico
        |-- robots.txt
        |-- _redirects
        `-- images/
            |-- hero.webp
            |-- hero-mobile.webp
            |-- about-lobby.webp
            |-- about-lobby-mobile.webp
            |-- facilities-smoking-corridor.webp
            |-- facilities-smoking-corridor-mobile.webp
            |-- blog/
            |-- gallery/
            `-- logo/
```

## Arsitektur Aplikasi

### Root repo

Root repo berfungsi sebagai wrapper dan area legacy/tooling:

- `package.json`: script build/dev/generate yang masuk ke `nuxt-app`.
- `wrangler.toml`: konfigurasi Cloudflare Pages. Output build diarahkan ke `nuxt-app/dist`.
- `functions/`: Cloudflare Pages Functions untuk middleware, proxy GTM, dan Meta CAPI.
- `docs/`: dokumentasi teknis GTM, Google Sheet, SEO recovery, dan rencana backoffice parser.
- File `index.html`, `index.css`, `index.js`, `lead_form.js`: kemungkinan versi statis/legacy website.
- File `rebuild_*`, `fix_*`, `restore_*`, `check_*`: script maintenance, recovery konten, SEO, dan validasi layout.

### Nuxt app

`nuxt-app` adalah website utama:

- `srcDir: 'app'`, jadi semua kode app Nuxt ada di `nuxt-app/app`.
- `ssr: true`.
- `site.url`: `https://wisma-apollo.my.id`.
- Bahasa: `id` default, `en`, dan `zh`.
- Strategy i18n: `prefix_except_default`, sehingga bahasa Indonesia tanpa prefix, bahasa lain memakai prefix.
- SEO global, Open Graph, Twitter Card, canonical, structured data, dan redirect legacy dikelola di `nuxt.config.ts` dan per halaman.

## Halaman dan Routing

### `/`

Homepage utama. Komposisi section:

- `HeroSection`
- `PromoStrip`
- `AboutSection`
- `FacilitiesSection`
- `RoomCards`
- `GallerySection`
- `TestimonialSection`
- `MapSection`

Homepage juga memasang SEO meta, canonical, Open Graph, Twitter Card, dan JSON-LD graph untuk organization, hotel, website, site navigation, webpage, dan breadcrumb.

### `/blog`

Index artikel blog. Data diambil dari Nuxt Content. Saat ini query memfilter path `/id/blog/`, sehingga konten blog yang tampil adalah konten Indonesia walaupun key async data memakai locale.

Fitur:

- Grid artikel
- Image card
- Category/tag sederhana dari frontmatter
- Excerpt/description
- SEO CollectionPage dan ItemList

### `/blog/[slug]`

Detail artikel blog. Mengambil artikel dari path `/id/blog/${slug}`.

Fitur:

- Hero image artikel
- Render markdown dengan `ContentRenderer`
- Tombol/elemen artikel bisa membuka booking modal jika punya atribut `data-booking-trigger="true"`
- SEO BlogPosting schema

### `/faq`

Halaman FAQ dengan accordion 8 pertanyaan dari locale JSON.

Fitur:

- FAQ accordion
- CTA WhatsApp di desktop
- CTA booking modal di mobile
- FAQPage schema

### `/thanks`

Halaman setelah user lanjut ke WhatsApp. Detail belum dibedah penuh di dokumen ini, tapi halaman ini dipakai oleh booking flow setelah membuka WhatsApp.

### `/[slug]`

Landing page SEO dinamis berbasis slug. Sumber konten:

- Locale JSON di `nuxt-app/locales/*.json`
- Fallback hardcoded di `app/pages/[slug].vue`

Slug yang didukung antara lain:

- `hotel-kuala-kurun`
- `penginapan-kuala-kurun`
- `guest-house-kuala-kurun`
- `homestay-kuala-kurun`
- `staycation-kuala-kurun`
- `tempat-istirahat-kuala-kurun`

Landing page mendukung:

- Header title/subtitle
- Section konten
- Price table
- Gallery
- FAQ
- Room cards
- WebPage schema
- Breadcrumb schema
- FAQPage schema bila ada FAQ

## Konten Blog

Konten blog Indonesia:

- `5-cafe-kopi-terbaik-di-kuala-kurun`
- `air-terjun-batu-mahasur`
- `batu-suli-desa-upon-batu`
- `bundaran-kuala-kurun`
- `hotel-di-kuala-kurun`
- `hotel-gunung-mas-kalimantan-tengah`
- `hotel-kuala-kurun-kalimantan-tengah`
- `kuliner-kuala-kurun`
- `penginapan-murah-kuala-kurun`
- `sejarah-hotel-gunung-mas-menjadi-sekolah-rakyat`
- `tips-menginap-kuala-kurun`
- `wisata-gunung-mas`

Konten blog Inggris tersedia sebagian besar paralel, tetapi halaman blog saat ini masih mengambil path Indonesia.

## Fitur Booking

Booking dikelola oleh `useBookingStore.ts` dan UI utamanya ada di `BookingModal.vue`.

Data yang dikumpulkan:

- Nama
- Nomor WhatsApp
- Check-in
- Check-out
- Jumlah kamar Single Bed
- Jumlah kamar Double Bed
- Jumlah tamu dewasa
- Opsi sarapan
- Catatan
- Attribution source/click id

Aturan harga:

- Single Bed: Rp200.000 per malam
- Double Bed: Rp250.000 per malam
- Sarapan: Rp25.000 per pack/orang/hari

Limit kamar:

- Single Bed maksimal 3 kamar
- Double Bed maksimal 1 kamar

Kapasitas dewasa:

- Single Bed: 2 dewasa per kamar
- Double Bed: 3 dewasa per kamar

Alur booking:

1. User klik reservasi atau CTA kamar.
2. Store membuka booking modal.
3. Store set tanggal default hari ini dan besok.
4. User isi data.
5. Validasi lokal dijalankan.
6. Store hash nomor telepon untuk tracking.
7. Lead dikirim best-effort ke endpoint first-party `/api/booking-lead`.
8. Event lead dikirim ke tracking.
9. WhatsApp dibuka dengan pesan reservasi yang sudah tersusun.
10. User diarahkan ke `/thanks`.

Catatan penting:

- Store memakai endpoint `BOOKING_LEAD_URL = '/api/booking-lead'`.
- Endpoint `functions/api/booking-lead.js` membaca private env `GOOGLE_APP_SCRIPT_URL`.
- Function meneruskan lead ke Google Apps Script untuk masuk ke Google Sheet dan mengirim Meta CAPI `Lead`.

## Tracking dan Ads

Tracking utama ada di `useTracking.ts`.

Konfigurasi:

- GTM Container: `GTM-5995VJ5B`
- Google Ads ID: `18107085431`
- GA4 Measurement ID: `G-24RFWGMFY8`
- Meta Pixel ID: `2098215477608895`
- Meta Graph version default: `v23.0`

Event funnel:

- `wisma_pv`: PageView
- `wisma_vc`: ViewContent
- `wisma_kontak`: Contact
- `wisma_atc`: AddToCart
- `wisma_lead`: Lead
- `wisma_user_data`: enhanced conversion user data

Tracking behavior:

- GTM diload first-party via `/px/gtm/gtm.js?id=GTM-5995VJ5B`.
- GTM diload otomatis saat idle. Homepage menunggu lebih lama untuk performa, halaman lain lebih cepat supaya cakupan tag terbaca.
- `gclid`, `wbraid`, `gbraid`, `fbclid`, dan campaign disimpan dengan TTL atribusi.
- Nomor telepon di-hash SHA-256 untuk Google/Meta.
- Meta Pixel browser diload langsung dari kode website hanya untuk aksi serius: `Contact`, `AddToCart`, dan `Lead`.
- Event pasif `PageView` dan `ViewContent` dikirim ke Meta lewat CAPI server tanpa memuat script Facebook.
- Meta CAPI dikirim untuk event `PageView`, `ViewContent`, `Contact`, `AddToCart`, dan `Lead`.
- Event id memakai transaction id untuk deduplikasi browser/server.

Dokumen terkait:

- `docs/gtm-wisma-apollo.md`
- `docs/google-sheet-webhook-columns.md`

## Cloudflare Functions

### `functions/_middleware.js`

Fungsi:

- Custom `robots.txt`
- Redirect legacy URL ke URL baru
- Redirect query search `?s=` ke `/blog/`
- Return `410 Gone` untuk spam path WordPress/ecommerce
- Redirect domain `*.pages.dev` ke `wisma-apollo.my.id`
- Strip locale prefix untuk beberapa redirect legacy

### `functions/api/booking-event.js`

Endpoint POST untuk Meta CAPI event. Wrapper ke `_meta-capi-core.js`.

### `functions/api/meta-capi.js`

Endpoint POST alternatif untuk Meta CAPI. Wrapper ke `_meta-capi-core.js`.

### `functions/api/booking-lead.js`

Endpoint POST yang:

- Menerima JSON payload atau form-urlencoded dari frontend
- Forward fields ke Google Apps Script lewat env `GOOGLE_APP_SCRIPT_URL`
- Mengirim Meta CAPI `Lead`
- Mengembalikan status sheet dan meta

### `functions/_meta-capi-core.js`

Core util:

- JSON response helper
- Sanitasi object kosong
- Validasi event name hanya `PageView`, `ViewContent`, `Contact`, `AddToCart`, dan `Lead`
- Kirim event ke Graph API Meta
- Tambah IP dan user-agent dari request

Environment yang dibutuhkan:

```text
META_PIXEL_ID=2098215477608895
GOOGLE_APP_SCRIPT_URL=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=TEST29643
META_GRAPH_VERSION=v23.0
```

## SEO

SEO website cukup lengkap:

- Meta title/description global dan per halaman
- Keyword lokal: hotel Kuala Kurun, penginapan Kuala Kurun, Wisma Apollo, hotel murah Kuala Kurun, guest house, homestay, Gunung Mas
- Canonical URL per halaman
- Open Graph dan Twitter Card
- Structured data:
  - Organization
  - Hotel
  - WebSite
  - SiteNavigationElement
  - WebPage
  - BreadcrumbList
  - FAQPage
  - CollectionPage
  - ItemList
  - BlogPosting
- Redirect 301 untuk URL lama dari blog/WordPress/legacy
- Sitemap module aktif
- Robots rules custom di middleware

Catatan:

- Ada banyak redirect yang sama antara `nuxt.config.ts` dan `functions/_middleware.js`. Ini bagus untuk safety di Cloudflare, tapi perlu dijaga agar tidak beda target.
- Ada teks mojibake di beberapa file, terutama komentar/string China atau emoji yang tampil rusak di hasil baca. Perlu audit encoding sebelum edit besar-besaran.

## Aset Visual

Folder utama:

- `public/images/logo`: logo dan favicon
- `public/images/gallery`: foto kamar, hotel, testimoni
- `public/images/blog`: gambar artikel
- `public/images/hero.webp` dan `hero-mobile.webp`: hero utama
- `about-lobby` dan `facilities-smoking-corridor`: section pendukung

Format dominan:

- `.webp` untuk performa
- Beberapa `.jpg`/`.png` untuk compatibility atau sumber blog

## Deployment

Cloudflare config:

```toml
name = "wisma-apollo"
compatibility_date = "2025-01-15"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "nuxt-app/dist"
```

Build output Nuxt generate masuk ke:

```text
nuxt-app/dist
```

Domain produksi yang dipakai di config:

```text
https://wisma-apollo.my.id
```

## Catatan Risiko / Hal Yang Perlu Dirapikan

- Blog i18n belum benar-benar dinamis karena query blog masih hardcoded ke `/id/blog/`.
- Endpoint frontend booking sudah memakai `/api/booking-lead` agar URL Google Apps Script tidak hardcode di repository publik.
- `BookingFormSchema` Zod sudah ada, tetapi store punya validasi manual sendiri. Bisa disatukan untuk mengurangi duplikasi.
- File root legacy dan script recovery banyak. Perlu klasifikasi: masih aktif, arsip, atau bisa dipindah ke folder `scripts/`.
- Beberapa string tampak mojibake, terutama karakter panah, emoji, dan Mandarin. Ini bisa mengganggu UX kalau ikut tampil di browser.
- README `nuxt-app` masih template Nuxt default, belum dokumentasi project Wisma Apollo.

## Spek Bisnis Singkat

Nama produk:

```text
Wisma Apollo Kuala Kurun
```

Positioning:

```text
Hotel dan penginapan strategis, bersih, nyaman, dan terjangkau di Kuala Kurun, Gunung Mas, Kalimantan Tengah.
```

Target user:

- Tamu dinas
- Pekerja proyek
- Sales/perjalanan kerja
- Keluarga
- Tamu transit dari/ke Palangka Raya dan area Gunung Mas
- Wisatawan lokal yang mencari info Kuala Kurun

Value proposition:

- Lokasi pusat Kuala Kurun
- Kamar AC
- WiFi gratis
- TV Android
- Kamar mandi dalam dengan shower
- Parkir luas
- Booking mudah via WhatsApp
- Harga mulai Rp200.000 per malam

Conversion goal utama:

- User mengisi form reservasi dan lanjut WhatsApp.

Conversion goal pendukung:

- Klik kontak WhatsApp
- Scroll/view room section
- Baca blog SEO
- Masuk dari keyword lokal lalu menuju booking
