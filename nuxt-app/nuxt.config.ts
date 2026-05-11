// Wisma Apollo – Nuxt 3 Configuration
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  srcDir: 'app',

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
    '@nuxt/icon',
    '@nuxtjs/sitemap',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Wisma Apollo - Hotel & Penginapan Kuala Kurun',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1,maximum-scale=5' },
        { name: 'description', content: 'Cari Hotel Kuala Kurun atau Penginapan Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan terbaik dengan fasilitas lengkap, kamar bersih, dan lokasi strategis di pusat kota. Booking hotel murah di Kuala Kurun sekarang!' },
        { name: 'keywords', content: 'hotel kuala kurun, penginapan kuala kurun, wisma kuala kurun, wisma apollo, hotel murah kuala kurun, penginapan murah kuala kurun, guest house kuala kurun, homestay kuala kurun, hotel gunung mas kalimantan tengah' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'theme-color', content: '#FAF6F0' },
        // Open Graph
        { property: 'og:title', content: 'Wisma Apollo - Hotel & Penginapan Kuala Kurun' },
        { property: 'og:description', content: 'Cari Hotel Kuala Kurun atau Penginapan Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan terbaik dengan fasilitas lengkap, kamar bersih, dan lokasi strategis di pusat kota.' },
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
        { name: 'twitter:title', content: 'Wisma Apollo - Hotel & Penginapan Kuala Kurun' },
        { name: 'twitter:description', content: 'Cari Hotel Kuala Kurun atau Penginapan Kuala Kurun yang nyaman? Wisma Apollo adalah pilihan terbaik.' },
        { name: 'twitter:image', content: 'https://wisma-apollo.my.id/images/hero.webp' },
      ],
      link: [
        { rel: 'icon', href: '/images/logo/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', href: '/images/logo/favicon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/images/logo/favicon-192.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  image: {
    quality: 80,
    format: ['webp'],
  },

  i18n: {
    baseUrl: 'https://wisma-apollo.my.id',
    locales: [
      { code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' },
    ],
    defaultLocale: 'id',
    fallbackLocale: 'id',
    langDir: '../locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
  },


  pinia: {
    storesDirs: ['./stores/**'],
  },
})
