<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="lp-back" style="color: rgba(255,255,255,0.7);">← {{ $t('common.backHome') }}</NuxtLink>
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

        <div style="margin-top: 32px;">
          <RoomCards />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import idMessages from '../../locales/id.json'
import enMessages from '../../locales/en.json'

const route = useRoute()

const { locale } = useI18n()
const localePath = useLocalePath()

const normalizeMessages = (messages: any) => messages?.default || messages

const messagesByLocale = {
  id: normalizeMessages(idMessages),
  en: normalizeMessages(enMessages),
} as const

const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value[0] : String(value || '')
})

const fallbackPages: Record<string, any> = {
  'hotel-kuala-kurun': {
    title: 'Hotel Kuala Kurun - Wisma Apollo',
    subtitle: 'Hotel terbaik & murah di Gunung Mas, Kalimantan Tengah',
    meta: 'Hotel Kuala Kurun terbaik dengan fasilitas lengkap. Kamar bersih, AC, WiFi gratis. Harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Kenapa Wisma Apollo Jadi Hotel Pilihan di Kuala Kurun?',
        paragraphs: [
          'Wisma Apollo hadir sebagai pilihan hotel dan penginapan nyaman di Kuala Kurun untuk tamu dinas, keluarga, maupun perjalanan kerja.',
          'Dengan lokasi strategis di Jl. Letjen Soeprapto No.56, tamu mudah menjangkau pusat kota, kuliner, cafe, dan area perkantoran.'
        ]
      },
      {
        heading: 'Fasilitas Lengkap dengan Harga Terjangkau',
        paragraphs: [
          'Kamar dilengkapi AC, TV Android 32", WiFi gratis, kamar mandi dalam shower, spring bed nyaman, linen bersih, dan suasana yang tenang.',
          'Harga promo mulai Rp200.000/malam untuk Single Bed dan Rp250.000/malam untuk Double Bed.'
        ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
}

// Fetch localized page data directly so footer SEO pages never render empty.
const pageData = computed(() => {
  const messages = messagesByLocale[locale.value as keyof typeof messagesByLocale] || idMessages
  const data = (messages.pages as Record<string, any>)?.[slug.value]
  
  if (data && typeof data === 'object' && typeof data.title === 'string') {
    return {
      title: String(data.title),
      subtitle: String(data.subtitle || ''),
      meta: String(data.meta || ''),
      sections: Array.isArray(data.sections) ? data.sections : []
    }
  }

  if (fallbackPages[slug.value]) {
    return fallbackPages[slug.value]
  }

  // Fallback if slug not found in i18n
  return {
    title: 'Wisma Apollo',
    subtitle: locale.value === 'id' ? 'Penginapan terbaik di Kuala Kurun' : 'The best accommodation in Kuala Kurun',
    meta: '',
    sections: [],
  }
})

useSeoMeta({
  title: () => pageData.value.title,
  description: () => pageData.value.meta,
  ogTitle: () => pageData.value.title,
  ogDescription: () => pageData.value.meta,
})

useScrollAnimation()
</script>
