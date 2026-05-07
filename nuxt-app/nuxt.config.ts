// Wisma Apollo – Nuxt 3 Configuration
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  srcDir: 'app',
  
  content: {
    // Standard content config for Nuxt 4
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/icon',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Wisma Apollo Kuala Kurun - Hotel Murah & Nyaman Promo Bulan Ini',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1,maximum-scale=5' },
        { name: 'description', content: 'Penginapan Kuala Kurun & Hotel Kuala Kurun terbaik - Wisma Apollo. Kamar bersih, AC, WiFi gratis, kedap suara. Harga mulai Rp200.000/malam. Lokasi strategis di pusat kota Gunung Mas, Kalimantan Tengah. Booking via WhatsApp!' },
        { name: 'keywords', content: 'penginapan kuala kurun, hotel kuala kurun, wisma apollo, penginapan murah kuala kurun, hotel murah kuala kurun, guest house kuala kurun, homestay kuala kurun, penginapan gunung mas, hotel gunung mas kalimantan tengah' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'theme-color', content: '#FAF6F0' },
        // Open Graph
        { property: 'og:title', content: 'Wisma Apollo - Penginapan & Hotel Murah di Kuala Kurun' },
        { property: 'og:description', content: 'Penginapan Kuala Kurun & Hotel Kuala Kurun terbaik. Kamar bersih, AC, WiFi gratis, kedap suara. Harga mulai Rp200.000/malam. Booking via WhatsApp!' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://wisma-apollo.my.id/' },
        { property: 'og:image', content: 'https://wisma-apollo.my.id/images/hero.webp' },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
      ],
      link: [
        { rel: 'canonical', href: 'https://wisma-apollo.my.id/' },
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
    locales: [
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'id',
    langDir: '../locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },


  pinia: {
    storesDirs: ['./stores/**'],
  },
})
