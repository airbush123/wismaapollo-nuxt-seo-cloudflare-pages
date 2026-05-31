// Wisma Apollo – Nuxt 3 Configuration
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  srcDir: 'app',
  features: {
    inlineStyles: true,
  },

  site: {
    url: 'https://wisma-apollo.my.id',
    name: 'Wisma Apollo Kuala Kurun',
  },
  
  content: {
    // Standard content config for Nuxt 4
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Hotel Kuala Kurun - Penginapan Wisma Apollo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1,maximum-scale=5' },
        { name: 'description', content: 'Mencari hotel Kuala Kurun atau wisma Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan penginapan Kuala Kurun dengan fasilitas bersih dan harga terjangkau.' },
        { name: 'keywords', content: 'hotel kuala kurun, penginapan kuala kurun, wisma kuala kurun, wisma apollo, hotel murah kuala kurun, penginapan murah kuala kurun, guest house kuala kurun, homestay kuala kurun, hotel gunung mas kalimantan tengah' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'theme-color', content: '#FAF6F0' },
        // Open Graph
        { property: 'og:title', content: 'Hotel Kuala Kurun - Penginapan Wisma Apollo' },
        { property: 'og:description', content: 'Mencari hotel Kuala Kurun atau wisma Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan penginapan Kuala Kurun dengan fasilitas bersih dan harga terjangkau.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://wisma-apollo.my.id/' },
        { property: 'og:image', content: 'https://wisma-apollo.my.id/images/hero.webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Tampak Depan Wisma Apollo Kuala Kurun' },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Hotel Kuala Kurun - Penginapan Wisma Apollo' },
        { name: 'twitter:description', content: 'Mencari hotel Kuala Kurun atau wisma Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan penginapan Kuala Kurun dengan fasilitas bersih dan harga terjangkau.' },
        { name: 'twitter:image', content: 'https://wisma-apollo.my.id/images/hero.webp' },
      ],
      link: [
        { rel: 'icon', href: '/images/logo/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', href: '/images/logo/favicon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/images/logo/favicon-192.png' },
        { rel: 'preload', as: 'image', href: '/images/hero-mobile.webp', media: '(max-width: 767px)', fetchpriority: 'high' },
        { rel: 'dns-prefetch', href: 'https://script.google.com' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  image: {
    quality: 80,
    format: ['webp'],
  },

  nitro: {
    prerender: {
      ignore: [
        /^\/(?:en|zh)(?:\/(?:en|zh))*\/sitemap\.xml$/,
        /^\/zh\/(?:blog|thanks|tag\/|category\/|author\/|hotel-kuala-kurun|penginapan-kuala-kurun|guest-house-kuala-kurun|homestay-kuala-kurun|staycation-kuala-kurun|tempat-istirahat-kuala-kurun)(?:\/|$)/,
        /^\/(?:(?:en|zh)\/)?(?:hotel-di-kuala-kurun-kalimantan-tengah-wisma-apollo-pilihan-strategis-nyaman|hotel-di-kuala-kurun-rekomendasi-penginapan-nyaman-dan-strategis|penginapan-murah-kuala-kurun|air-terjun-batu-mahasur-keindahan-tersembunyi-di-kuala-kurun|menikmati-keindahan-alam-batu-suli-di-desa-upon-batu-kabupaten-gunung-mas|bundaran-kuala-kurun-simbol-kota-yang-menyimpan-pesona|icon-tugu-selamat-datang-di-kuala-kurun-simbol-identitas-dan-keramahan-kota|harga|hotel-murah-kuala-kurun|guest-house-kurun|penginapan-kurun|faq-wisma|tentang-kami)(?:\/|$)/,
        /^\/(?:(?:en|zh)\/)?(?:20\d{2}\/\d{2}|category\/|tag\/|author\/|feed)(?:\/|$)/,
      ],
    },
  },

  i18n: {
    baseUrl: 'https://wisma-apollo.my.id',
    locales: [
      { code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' },
    ],
    defaultLocale: 'id',
    // @ts-expect-error Existing runtime i18n option; Nuxt i18n's generated type omits it here.
    fallbackLocale: 'id',
    langDir: '../locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
  },


  pinia: {
    storesDirs: ['./stores/**'],
  },

  routeRules: {
    '/hotel-di-kuala-kurun-kalimantan-tengah-wisma-apollo-pilihan-strategis-nyaman': {
      redirect: { to: '/blog/hotel-kuala-kurun-kalimantan-tengah/', statusCode: 301 },
    },
    '/hotel-di-kuala-kurun-kalimantan-tengah-wisma-apollo-pilihan-strategis-nyaman/': {
      redirect: { to: '/blog/hotel-kuala-kurun-kalimantan-tengah/', statusCode: 301 },
    },
    '/hotel-di-kuala-kurun-rekomendasi-penginapan-nyaman-dan-strategis': {
      redirect: { to: '/blog/hotel-di-kuala-kurun/', statusCode: 301 },
    },
    '/hotel-di-kuala-kurun-rekomendasi-penginapan-nyaman-dan-strategis/': {
      redirect: { to: '/blog/hotel-di-kuala-kurun/', statusCode: 301 },
    },
    '/penginapan-murah-kuala-kurun': { redirect: { to: '/blog/penginapan-murah-kuala-kurun/', statusCode: 301 } },
    '/penginapan-murah-kuala-kurun/': { redirect: { to: '/blog/penginapan-murah-kuala-kurun/', statusCode: 301 } },
    '/air-terjun-batu-mahasur-keindahan-tersembunyi-di-kuala-kurun': {
      redirect: { to: '/blog/air-terjun-batu-mahasur/', statusCode: 301 },
    },
    '/air-terjun-batu-mahasur-keindahan-tersembunyi-di-kuala-kurun/': {
      redirect: { to: '/blog/air-terjun-batu-mahasur/', statusCode: 301 },
    },
    '/menikmati-keindahan-alam-batu-suli-di-desa-upon-batu-kabupaten-gunung-mas': {
      redirect: { to: '/blog/batu-suli-desa-upon-batu/', statusCode: 301 },
    },
    '/menikmati-keindahan-alam-batu-suli-di-desa-upon-batu-kabupaten-gunung-mas/': {
      redirect: { to: '/blog/batu-suli-desa-upon-batu/', statusCode: 301 },
    },
    '/bundaran-kuala-kurun-simbol-kota-yang-menyimpan-pesona': {
      redirect: { to: '/blog/bundaran-kuala-kurun/', statusCode: 301 },
    },
    '/bundaran-kuala-kurun-simbol-kota-yang-menyimpan-pesona/': {
      redirect: { to: '/blog/bundaran-kuala-kurun/', statusCode: 301 },
    },
    '/icon-tugu-selamat-datang-di-kuala-kurun-simbol-identitas-dan-keramahan-kota': {
      redirect: { to: '/blog/bundaran-kuala-kurun/', statusCode: 301 },
    },
    '/icon-tugu-selamat-datang-di-kuala-kurun-simbol-identitas-dan-keramahan-kota/': {
      redirect: { to: '/blog/bundaran-kuala-kurun/', statusCode: 301 },
    },
    '/harga': { redirect: { to: '/hotel-kuala-kurun/', statusCode: 301 } },
    '/harga/': { redirect: { to: '/hotel-kuala-kurun/', statusCode: 301 } },
    '/hotel-murah-kuala-kurun': { redirect: { to: '/hotel-kuala-kurun/', statusCode: 301 } },
    '/hotel-murah-kuala-kurun/': { redirect: { to: '/hotel-kuala-kurun/', statusCode: 301 } },
    '/guest-house-kurun': { redirect: { to: '/guest-house-kuala-kurun/', statusCode: 301 } },
    '/guest-house-kurun/': { redirect: { to: '/guest-house-kuala-kurun/', statusCode: 301 } },
    '/penginapan-kurun': { redirect: { to: '/penginapan-kuala-kurun/', statusCode: 301 } },
    '/penginapan-kurun/': { redirect: { to: '/penginapan-kuala-kurun/', statusCode: 301 } },
    '/faq-wisma': { redirect: { to: '/faq/', statusCode: 301 } },
    '/faq-wisma/': { redirect: { to: '/faq/', statusCode: 301 } },
    '/tentang-kami': { redirect: { to: '/', statusCode: 301 } },
    '/tentang-kami/': { redirect: { to: '/', statusCode: 301 } },
    '/2024/10': { redirect: { to: '/blog/', statusCode: 301 } },
    '/2024/10/': { redirect: { to: '/blog/', statusCode: 301 } },
    '/2025/06': { redirect: { to: '/blog/', statusCode: 301 } },
    '/2025/06/': { redirect: { to: '/blog/', statusCode: 301 } },
    '/tag/guest-house-kurun': { redirect: { to: '/guest-house-kuala-kurun/', statusCode: 301 } },
    '/tag/guest-house-kurun/': { redirect: { to: '/guest-house-kuala-kurun/', statusCode: 301 } },
    '/tag/staycation-kuala-kurun': { redirect: { to: '/staycation-kuala-kurun/', statusCode: 301 } },
    '/tag/staycation-kuala-kurun/': { redirect: { to: '/staycation-kuala-kurun/', statusCode: 301 } },
    '/tag/penginapan-di-kuala-kurun': { redirect: { to: '/penginapan-kuala-kurun/', statusCode: 301 } },
    '/tag/penginapan-di-kuala-kurun/': { redirect: { to: '/penginapan-kuala-kurun/', statusCode: 301 } },
    '/en/tag/**': { redirect: { to: '/en/blog/', statusCode: 301 } },
    '/en/category/**': { redirect: { to: '/en/blog/', statusCode: 301 } },
    '/en/author/**': { redirect: { to: '/en/blog/', statusCode: 301 } },
    '/zh/tag/**': { redirect: { to: '/zh/', statusCode: 301 } },
    '/zh/category/**': { redirect: { to: '/zh/', statusCode: 301 } },
    '/zh/author/**': { redirect: { to: '/zh/', statusCode: 301 } },
    '/category/**': { redirect: { to: '/blog/', statusCode: 301 } },
    '/tag/**': { redirect: { to: '/blog/', statusCode: 301 } },
    '/author/**': { redirect: { to: '/blog/', statusCode: 301 } },
    '/feed/': { redirect: { to: '/blog/', statusCode: 301 } },
    '/px/gtm/**': { proxy: 'https://www.googletagmanager.com/**' },
    '/px/ga/**': { proxy: 'https://www.google-analytics.com/**' },
  },
})
