<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="lp-back lp-back-light">← {{ $t('common.backHome') }}</NuxtLink>
        <h1>{{ pageData.title }}</h1>
        <p>{{ pageData.subtitle }}</p>
      </div>
    </div>

    <div class="lp-content">
      <div class="container">
        <div v-for="(section, i) in pageData.sections" :key="i">
          <h2>{{ section.heading }}</h2>
          <p v-for="(p, j) in section.paragraphs" :key="j">{{ p }}</p>
        </div>

        <div v-if="pageData.priceRows?.length" class="lp-price">
          <h2>{{ pageData.priceHeading || 'Harga Kamar' }}</h2>
          <div class="lp-price-table" role="table">
            <div class="lp-price-row lp-price-head" role="row">
              <span role="columnheader">Tipe Kamar</span>
              <span role="columnheader">Harga</span>
            </div>
            <div v-for="(row, i) in pageData.priceRows" :key="i" class="lp-price-row" role="row">
              <span role="cell">{{ row.type }}</span>
              <strong role="cell">{{ row.price }}</strong>
            </div>
          </div>
          <p v-if="pageData.priceNote">{{ pageData.priceNote }}</p>
        </div>

        <div v-if="pageData.gallery?.length" class="lp-gallery-wrap">
          <h2>{{ pageData.galleryHeading || 'Foto Wisma Apollo' }}</h2>
          <div class="gallery" role="list">
            <NuxtImg
              v-for="(image, i) in pageData.gallery"
              :key="i"
              :src="image.src"
              :alt="image.alt"
              width="400"
              height="300"
              loading="lazy"
              format="webp"
              sizes="sm:50vw md:25vw"
              role="listitem"
            />
          </div>
        </div>

        <div v-if="pageData.faqs?.length" class="lp-faq">
          <h2>Pertanyaan Seputar {{ pageData.title }}</h2>
          <div v-for="(faq, i) in pageData.faqs" :key="i" class="lp-faq-item">
            <h3>{{ faq.q }}</h3>
            <p>{{ faq.a }}</p>
          </div>
        </div>

        <div style="margin-top: 32px;">
          <RoomCards />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import idMessagesRaw from '../../locales/id.json?raw'
import enMessagesRaw from '../../locales/en.json?raw'
import zhMessagesRaw from '../../locales/zh.json?raw'

const route = useRoute()

const { locale } = useI18n()
const localePath = useLocalePath()

const parseMessages = (messages: string) => JSON.parse(messages)
const normalizeMessages = (messages: any) => messages?.default || messages

const messagesByLocale = {
  id: parseMessages(idMessagesRaw),
  en: parseMessages(enMessagesRaw),
  zh: parseMessages(zhMessagesRaw),
} as const

const resolveLocaleMessages = (messages: any, localeCode: string) => {
  const normalized = normalizeMessages(messages)

  if (normalized?.pages) {
    return normalized
  }

  if (normalized?.[localeCode]?.pages) {
    return normalized[localeCode]
  }

  if (normalized?.id?.pages) {
    return normalized.id
  }

  return normalized || {}
}

const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value[0] || '' : String(value || '')
})

const fallbackPages: Record<string, any> = {
  'hotel-kuala-kurun': {
    title: 'Hotel Kuala Kurun - Wisma Apollo',
    seoTitle: 'Hotel Kuala Kurun - Wisma Apollo | Mulai Rp200.000',
    subtitle: 'Hotel strategis, bersih, dan nyaman di pusat Kuala Kurun',
    meta: 'Cari hotel Kuala Kurun yang bersih dan strategis? Wisma Apollo menyediakan kamar AC, WiFi, TV Android, shower, parkir luas, mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Kenapa Wisma Apollo Jadi Hotel Pilihan di Kuala Kurun?',
        paragraphs: [
          'Kalau kamu mencari hotel Kuala Kurun yang bersih, nyaman, dan harganya masuk akal, Wisma Apollo adalah pilihan yang praktis. Lokasinya berada di Jl. Letjen Soeprapto No.56, tepat di area pusat kota Kuala Kurun, Kabupaten Gunung Mas.',
          'Wisma Apollo cocok untuk tamu dinas, pekerja proyek, sales, keluarga, maupun tamu yang transit setelah perjalanan darat. Suasananya tenang, proses reservasi mudah lewat WhatsApp, dan kamar disiapkan agar tamu bisa langsung istirahat dengan nyaman.'
        ]
      },
      {
        heading: 'Fasilitas Hotel Wisma Apollo',
        paragraphs: [
          'Setiap kamar dilengkapi AC, TV Android 32 inch, WiFi gratis, kamar mandi dalam dengan shower, handuk bersih, amenities, spring bed nyaman, serta dinding dan plafon kedap suara untuk istirahat yang lebih tenang.',
          'Tamu juga mendapatkan air mineral, kopi, dan teh gratis setiap hari. Area parkir luas, lingkungan tenang, dan bantuan resepsionis membuat Wisma Apollo nyaman untuk menginap harian maupun beberapa malam.'
        ]
      },
      {
        heading: 'Lokasi Hotel di Pusat Kuala Kurun',
        paragraphs: [
          'Wisma Apollo berada di Kelurahan Tampang Tumbang Anjir, Kecamatan Kurun, Kabupaten Gunung Mas, Kalimantan Tengah. Dari penginapan ini, tamu mudah menjangkau area perkantoran, kuliner, cafe, minimarket, dan titik aktivitas utama di Kuala Kurun.',
          'Bagi tamu dari Palangka Raya atau daerah sekitar Gunung Mas, lokasi di jalan utama membantu perjalanan lebih mudah. Begitu masuk kota Kuala Kurun, Wisma Apollo mudah ditemukan dan cocok sebagai tempat istirahat yang strategis.'
        ]
      },
      {
        heading: 'Hotel Kuala Kurun untuk Tamu Dinas dan Keluarga',
        paragraphs: [
          'Sebagian besar tamu Wisma Apollo datang untuk urusan kerja, dinas pemerintahan, proyek, kunjungan keluarga, atau perjalanan singkat. Karena itu, fasilitas kamar dibuat sederhana tetapi lengkap: bersih, sejuk, tenang, dan mudah dipesan.',
          'Jika kamu membutuhkan hotel di Kuala Kurun yang tidak ribet, punya harga transparan, dan tetap nyaman untuk tidur nyenyak, Wisma Apollo layak masuk daftar pilihan utama.'
        ]
      }
    ],
    priceHeading: 'Harga Kamar Hotel di Kuala Kurun',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' },
      { type: 'Sarapan by request', price: '+Rp25.000/pack' }
    ],
    priceNote: 'Harga sudah termasuk fasilitas kamar, WiFi, air mineral, kopi, dan teh. Untuk memastikan ketersediaan kamar, reservasi paling cepat dilakukan melalui WhatsApp resmi Wisma Apollo.',
    galleryHeading: 'Foto Hotel Wisma Apollo',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Hotel Kuala Kurun - Tampak depan Wisma Apollo' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Hotel Kuala Kurun - Fasilitas TV dan meja kerja' },
      { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Hotel Kuala Kurun - Kamar single bed Wisma Apollo' },
      { src: '/images/gallery/kamar-penginapan-murah-kuala-kurun.webp', alt: 'Hotel Kuala Kurun - Kamar mandi dalam dengan shower' }
    ],
    faqs: [
      {
        q: 'Berapa harga kamar hotel di Wisma Apollo Kuala Kurun?',
        a: 'Harga kamar mulai Rp200.000 per malam untuk Single Bed dan Rp250.000 per malam untuk Double Bed.'
      },
      {
        q: 'Apakah Wisma Apollo cocok untuk tamu dinas?',
        a: 'Ya. Lokasinya strategis di pusat Kuala Kurun, kamar bersih, tersedia WiFi gratis, AC, TV Android, dan suasana tenang untuk istirahat setelah bekerja.'
      },
      {
        q: 'Bagaimana cara booking hotel Wisma Apollo?',
        a: 'Reservasi bisa langsung melalui WhatsApp di 0818 232 021 dengan mengirim nama, tanggal check-in, tipe kamar, dan jumlah tamu.'
      }
    ]
  },
  'penginapan-kuala-kurun': {
    title: 'Penginapan Kuala Kurun - Wisma Apollo',
    subtitle: 'Penginapan bersih, nyaman & murah di Kuala Kurun',
    meta: 'Penginapan Kuala Kurun terbaik. Wisma Apollo, kamar bersih, AC, WiFi gratis. Harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Penginapan Nyaman di Kuala Kurun',
        paragraphs: [
          'Mencari penginapan di Kuala Kurun yang bersih, nyaman, dan harganya terjangkau? Wisma Apollo adalah pilihan tepat.',
          'Lokasinya strategis di pusat kota dan cocok untuk keluarga, perjalanan dinas, maupun tamu yang butuh tempat istirahat tenang.'
        ]
      }
    ],
    faqs: []
  },
  'guest-house-kuala-kurun': {
    title: 'Guest House Kuala Kurun - Wisma Apollo',
    subtitle: 'Guest house nyaman dengan fasilitas hotel di Kuala Kurun',
    meta: 'Guest house di Kuala Kurun dengan fasilitas lengkap. Wisma Apollo, harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Guest House Terbaik di Kuala Kurun',
        paragraphs: [
          'Wisma Apollo cocok untuk tamu yang mencari guest house bersih, tenang, dan strategis di Kuala Kurun.',
          'Fasilitas kamar lengkap dengan AC, TV Android, WiFi gratis, shower, dan tempat tidur nyaman.'
        ]
      }
    ],
    faqs: []
  },
  'homestay-kuala-kurun': {
    title: 'Homestay Kuala Kurun - Wisma Apollo',
    subtitle: 'Homestay nyaman seperti di rumah sendiri',
    meta: 'Homestay di Kuala Kurun yang nyaman dan bersih. Wisma Apollo, harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Homestay Nyaman di Kuala Kurun',
        paragraphs: [
          'Rasakan suasana menginap yang tenang dan nyaman seperti di rumah sendiri di Wisma Apollo Kuala Kurun.',
          'Kamar bersih, fasilitas modern, dan lokasi pusat kota membuat pengalaman menginap lebih praktis.'
        ]
      }
    ],
    faqs: []
  },
  'staycation-kuala-kurun': {
    title: 'Staycation Kuala Kurun - Wisma Apollo',
    subtitle: 'Nikmati staycation nyaman di pusat kota Kuala Kurun',
    meta: 'Staycation di Kuala Kurun yang menyenangkan. Wisma Apollo, harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Staycation di Kuala Kurun',
        paragraphs: [
          'Butuh refreshing tanpa harus jauh? Wisma Apollo menawarkan pengalaman staycation yang nyaman di Kuala Kurun.',
          'Nikmati kasur nyaman, AC dingin, TV Android 32", WiFi gratis, dan suasana kamar yang bersih.'
        ]
      }
    ],
    faqs: []
  },
  'tempat-istirahat-kuala-kurun': {
    title: 'Tempat Istirahat Kuala Kurun - Wisma Apollo',
    subtitle: 'Tempat istirahat terbaik di Kuala Kurun, Gunung Mas',
    meta: 'Tempat istirahat nyaman di Kuala Kurun. Wisma Apollo, kamar bersih & kedap suara. Harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Tempat Istirahat Ideal di Kuala Kurun',
        paragraphs: [
          'Setelah perjalanan panjang atau hari kerja yang melelahkan, Wisma Apollo menyediakan tempat istirahat yang bersih dan nyaman.',
          'Kamar tenang, fasilitas lengkap, dan harga terjangkau membuat Wisma Apollo cocok untuk singgah di Kuala Kurun.'
        ]
      }
    ],
    faqs: []
  }
}

// Fetch localized page data directly so footer SEO pages never render empty.
const pageData = computed(() => {
  const rawMessages = messagesByLocale[locale.value as keyof typeof messagesByLocale] || messagesByLocale.id
  const messages = resolveLocaleMessages(rawMessages, locale.value)
  const currentSlug = slug.value
  const data = (messages.pages as Record<string, any>)?.[currentSlug]
  
  if (data && typeof data === 'object' && typeof data.title === 'string') {
    return {
      title: String(data.title),
      seoTitle: String(data.seoTitle || data.title),
      subtitle: String(data.subtitle || ''),
      meta: String(data.meta || ''),
      sections: Array.isArray(data.sections) ? data.sections : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      priceHeading: String(data.priceHeading || ''),
      priceRows: Array.isArray(data.priceRows) ? data.priceRows : [],
      priceNote: String(data.priceNote || ''),
      galleryHeading: String(data.galleryHeading || ''),
      gallery: Array.isArray(data.gallery) ? data.gallery : []
    }
  }

  if (fallbackPages[currentSlug]) {
    return fallbackPages[currentSlug]
  }

  // Fallback if slug not found in i18n
  return {
    title: 'Wisma Apollo',
    subtitle: locale.value === 'id' ? 'Penginapan terbaik di Kuala Kurun' : 'The best accommodation in Kuala Kurun',
    meta: '',
    sections: [],
    faqs: [],
  }
})

useSeoMeta({
  title: () => pageData.value.seoTitle || pageData.value.title,
  description: () => pageData.value.meta,
  ogTitle: () => pageData.value.seoTitle || pageData.value.title,
  ogDescription: () => pageData.value.meta,
  ogUrl: () => `https://wisma-apollo.my.id/${slug.value}`,
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: `https://wisma-apollo.my.id/${slug.value}` },
  ],
  script: pageData.value.faqs?.length
    ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: pageData.value.faqs.map((faq: any) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        },
      ]
    : [],
}))

useScrollAnimation()
</script>
