<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <a :href="canonicalPath('/')" class="lp-back lp-back-light">← {{ $t('common.backHome') }}</a>
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
          <h2>{{ pageData.priceHeading || priceFallbackHeading }}</h2>
          <div class="lp-price-table" role="table">
            <div class="lp-price-row lp-price-head" role="row">
              <span role="columnheader">{{ roomTypeLabel }}</span>
              <span role="columnheader">{{ priceLabel }}</span>
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
          <h2>{{ faqHeading }}</h2>
          <div v-for="(faq, i) in pageData.faqs" :key="i" class="lp-faq-item">
            <h3>{{ faq.q }}</h3>
            <p>{{ faq.a }}</p>
          </div>
        </div>

        <div v-if="pageData.relatedLinks?.length" class="lp-related" aria-labelledby="related-guides-heading">
          <h2 id="related-guides-heading">{{ pageData.relatedHeading || relatedFallbackHeading }}</h2>
          <div class="lp-related-grid">
            <a
              v-for="(item, i) in pageData.relatedLinks"
              :key="i"
              :href="canonicalPath(item.href)"
              class="lp-related-card"
            >
              <strong>{{ item.label }}</strong>
              <span>{{ item.text }}</span>
            </a>
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
import {
  SITE_URL,
  buildBreadcrumbSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from '~/composables/useSitelinkSchema'
import idMessagesRaw from '../../locales/id.json?raw'
import enMessagesRaw from '../../locales/en.json?raw'
import zhMessagesRaw from '../../locales/zh.json?raw'

const route = useRoute()

const { locale } = useI18n()
const canonicalPath = useCanonicalLocalePath()
const siteUrl = SITE_URL

if (locale.value === 'zh') {
  await navigateTo('/zh/', { redirectCode: 301 })
}

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
          'Kalau kamu mencari hotel Kuala Kurun yang bersih, nyaman, dan harganya masuk akal, Wisma Apollo adalah pilihan praktis sekaligus wisma Kuala Kurun yang berada di Jl. Letjen Soeprapto No.56, tepat di area pusat kota Kuala Kurun, Kabupaten Gunung Mas.',
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
          'Jika kamu membutuhkan hotel di Kuala Kurun yang tidak ribet, punya harga transparan, dan tetap nyaman untuk tidur nyenyak, Wisma Apollo layak dipertimbangkan.'
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
      { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Hotel Kuala Kurun - Kamar double bed Wisma Apollo' }
    ],
    relatedHeading: 'Panduan Terkait Hotel Kuala Kurun',
    relatedLinks: [
      {
        href: '/blog/hotel-kuala-kurun-kalimantan-tengah/',
        label: 'Panduan hotel di Kuala Kurun, Kalimantan Tengah',
        text: 'Baca cara memilih hotel dari sisi lokasi, fasilitas kamar, harga, dan kemudahan reservasi.'
      },
      {
        href: '/blog/tips-menginap-kuala-kurun/',
        label: 'Tips menginap nyaman di Kuala Kurun',
        text: 'Panduan praktis untuk tamu dinas, keluarga, pekerja lapangan, dan perjalanan transit.'
      }
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
    seoTitle: 'Penginapan Kuala Kurun - Wisma Apollo | Mulai Rp200.000',
    subtitle: 'Penginapan bersih, nyaman & murah di Kuala Kurun',
    meta: 'Butuh penginapan di Kuala Kurun yang nyaman dan murah? Wisma Apollo menyediakan kamar AC, WiFi gratis, TV Android, shower, parkir luas, dan harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Tempat Menginap yang Nyaman dan Mudah Dipesan',
        paragraphs: [
          'Sebagai wisma Kuala Kurun yang melayani tamu harian, dinas, dan keluarga, Wisma Apollo hadir untuk tamu yang membutuhkan tempat bermalam bersih, tenang, dan praktis. Lokasinya berada di Jl. Letjen Soeprapto No.56, sehingga tamu lebih mudah menjangkau pusat kota, area perkantoran, tempat makan, cafe, minimarket, laundry, dan titik aktivitas utama di Kabupaten Gunung Mas.',
          'Banyak tamu datang untuk urusan dinas, pekerjaan lapangan, kunjungan keluarga, perjalanan sales, atau transit setelah perjalanan darat. Karena kebutuhan tiap tamu berbeda, Wisma Apollo menyiapkan kamar yang sederhana, rapi, sejuk, dan nyaman untuk istirahat tanpa proses reservasi yang rumit.'
        ]
      },
      {
        heading: 'Fasilitas Penginapan Wisma Apollo',
        paragraphs: [
          'Setiap kamar dilengkapi AC, TV Android 32 inch, WiFi gratis, kamar mandi dalam dengan shower, handuk bersih, amenities, spring bed nyaman, bantal bulu angsa, serta dinding dan plafon kedap suara.',
          'Tamu juga mendapatkan air mineral, kopi, dan teh gratis setiap hari. Area parkir luas dan jalur komunikasi lewat WhatsApp membuat proses menginap terasa lebih mudah, terutama untuk tamu yang baru tiba sore atau malam hari.'
        ]
      },
      {
        heading: 'Cocok untuk Dinas, Keluarga, dan Transit',
        paragraphs: [
          'Tamu dinas bisa beristirahat dengan tenang setelah agenda kantor atau kunjungan lapangan. Pekerja proyek dan sales mendapatkan kamar yang mudah dipesan, harga jelas, serta akses ke jalan utama.',
          'Untuk keluarga kecil dan tamu transit, kamar bersih, lokasi yang mudah ditemukan, dan fasilitas dasar yang lengkap membantu perjalanan terasa lebih rapi.'
        ]
      },
      {
        heading: 'Harga dan Cara Booking',
        paragraphs: [
          'Harga kamar mulai Rp200.000 per malam untuk Single Bed dan Rp250.000 per malam untuk Double Bed. Extra bed dan sarapan dapat ditanyakan sesuai kebutuhan.',
          'Reservasi bisa dilakukan langsung melalui WhatsApp resmi Wisma Apollo dengan mengirim tanggal check-in, jumlah tamu, pilihan kamar, dan estimasi kedatangan.'
        ]
      }
    ],
    priceHeading: 'Harga Kamar Penginapan di Kuala Kurun',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' },
      { type: 'Sarapan by request', price: '+Rp25.000/pack' }
    ],
    priceNote: 'Harga dapat berubah mengikuti ketersediaan kamar dan periode menginap. Untuk informasi paling akurat, hubungi WhatsApp resmi Wisma Apollo sebelum datang.',
    galleryHeading: 'Foto Penginapan Wisma Apollo',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Penginapan Kuala Kurun - Tampak depan Wisma Apollo' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Penginapan Kuala Kurun - Fasilitas kamar dengan TV Android' },
      { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Penginapan Kuala Kurun - Kamar single bed Wisma Apollo' },
      { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Penginapan Kuala Kurun - Kamar double bed Wisma Apollo' }
    ],
    relatedHeading: 'Panduan Terkait Penginapan Kuala Kurun',
    relatedLinks: [
      {
        href: '/blog/penginapan-murah-kuala-kurun/',
        label: 'Panduan penginapan murah di Kuala Kurun',
        text: 'Cek cara menilai harga, fasilitas, lokasi, dan kemudahan reservasi sebelum memilih kamar.'
      },
      {
        href: '/blog/tips-menginap-kuala-kurun/',
        label: 'Tips menginap nyaman di Kuala Kurun',
        text: 'Panduan praktis untuk tamu dinas, keluarga, pekerja lapangan, dan perjalanan singgah.'
      }
    ],
    faqs: [
      {
        q: 'Apakah Wisma Apollo termasuk penginapan murah di Kuala Kurun?',
        a: 'Ya. Harga kamar mulai Rp200.000 per malam untuk Single Bed dan Rp250.000 per malam untuk Double Bed, dengan fasilitas AC, WiFi gratis, TV Android, shower, handuk, dan amenities.'
      },
      {
        q: 'Apakah penginapan ini dekat pusat kota Kuala Kurun?',
        a: 'Ya. Wisma Apollo berada di Jl. Letjen Soeprapto No.56, Kuala Kurun, dekat area pusat kota, tempat makan, minimarket, dan kebutuhan harian.'
      },
      {
        q: 'Bagaimana cara reservasi kamar di Wisma Apollo?',
        a: 'Reservasi bisa langsung melalui WhatsApp 0818 232 021 dengan mengirim tanggal check-in, jumlah tamu, tipe kamar, dan kebutuhan tambahan.'
      }
    ]
  },  'guest-house-kuala-kurun': {
    title: 'Guest House Kuala Kurun - Wisma Apollo',
    seoTitle: 'Guest House Kuala Kurun - Wisma Apollo | Fasilitas Hotel Mulai Rp200.000',
    subtitle: 'Guest house nyaman dengan fasilitas hotel di Kuala Kurun',
    meta: 'Guest house di Kuala Kurun dengan fasilitas lengkap: AC, WiFi gratis, TV Android, kamar mandi dalam, parkir luas. Wisma Apollo, harga mulai Rp200.000/malam di pusat kota Gunung Mas.',
    sections: [
      {
        heading: 'Guest House Nyaman di Kuala Kurun',
        paragraphs: [
          'Wisma Apollo cocok untuk tamu yang mencari guest house bersih, tenang, dan strategis di Kuala Kurun. Berlokasi di Jl. Letjen Soeprapto No.56, tepat di pusat kota Kabupaten Gunung Mas.',
          'Fasilitas kamar lengkap dengan AC, TV Android 32 inch, WiFi gratis, shower, kamar mandi dalam, handuk bersih, amenities, dan tempat tidur nyaman. Semua ini membuat Wisma Apollo lebih dari sekadar guest house biasa.'
        ]
      },
      {
        heading: 'Kenapa Memilih Guest House di Kuala Kurun?',
        paragraphs: [
          'Guest house menjadi pilihan populer bagi tamu yang menginginkan kenyamanan rumah dengan fasilitas hotel. Berbeda dengan hotel besar yang formal, guest house memberikan suasana yang lebih personal dan hangat.',
          'Di Kuala Kurun, guest house seperti Wisma Apollo menawarkan keseimbangan yang pas: harga terjangkau mulai Rp200.000/malam, fasilitas modern, dan lokasi strategis dekat perkantoran, cafe, serta pusat kota.'
        ]
      },
      {
        heading: 'Cocok untuk Siapa Saja',
        paragraphs: [
          'Wisma Apollo melayani berbagai jenis tamu: pegawai dinas, pekerja proyek, sales area, keluarga yang berkunjung, wisatawan, hingga tamu transit. Proses reservasi mudah melalui WhatsApp, dan staf siap membantu kebutuhan menginap Anda.',
          'Untuk tamu yang membawa kendaraan, tersedia area parkir luas dan aman. Lokasi di jalan utama membuat akses ke tempat makan, minimarket, dan kebutuhan harian sangat mudah dijangkau.'
        ]
      }
    ],
    priceHeading: 'Harga Kamar Guest House',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' },
      { type: 'Sarapan by request', price: '+Rp25.000/pack' }
    ],
    priceNote: 'Harga sudah termasuk AC, WiFi, TV Android, air mineral, kopi, dan teh gratis.',
    galleryHeading: 'Foto Guest House Wisma Apollo',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Guest House Kuala Kurun - Tampak depan Wisma Apollo' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Guest House Kuala Kurun - Fasilitas kamar' },
      { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Guest House Kuala Kurun - Kamar single bed' },
      { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Guest House Kuala Kurun - Kamar double bed' }
    ],
    faqs: [
      {
        q: 'Apa bedanya guest house dengan hotel biasa?',
        a: 'Guest house biasanya lebih kecil dan personal dibanding hotel. Di Wisma Apollo, tamu mendapatkan kenyamanan guest house dengan fasilitas setara hotel: AC, WiFi, TV Android, kamar mandi dalam, dan parkir luas.'
      },
      {
        q: 'Berapa harga menginap di guest house Wisma Apollo?',
        a: 'Harga kamar mulai Rp200.000 per malam untuk Single Bed dan Rp250.000 per malam untuk Double Bed, sudah termasuk fasilitas lengkap.'
      },
      {
        q: 'Apakah guest house ini cocok untuk keluarga?',
        a: 'Ya, kamar Double Bed cocok untuk pasangan atau keluarga kecil. Tersedia juga extra bed dengan biaya tambahan Rp50.000.'
      }
    ]
  },
  'homestay-kuala-kurun': {
    title: 'Homestay Kuala Kurun - Wisma Apollo',
    seoTitle: 'Homestay Kuala Kurun - Wisma Apollo | Nyaman & Strategis Rp200.000',
    subtitle: 'Homestay nyaman seperti di rumah sendiri',
    meta: 'Homestay di Kuala Kurun yang nyaman, bersih, dan strategis. Wisma Apollo menawarkan kamar dengan AC, WiFi gratis, TV Android, dan parkir luas. Harga mulai Rp200.000/malam di pusat Gunung Mas.',
    sections: [
      {
        heading: 'Homestay Nyaman di Kuala Kurun',
        paragraphs: [
          'Rasakan suasana menginap yang tenang dan nyaman seperti di rumah sendiri di Wisma Apollo Kuala Kurun. Berlokasi strategis di Jl. Letjen Soeprapto No.56, homestay ini menawarkan akses mudah ke pusat kota.',
          'Kamar bersih, fasilitas modern, dan lokasi pusat kota membuat pengalaman menginap lebih praktis. Cocok untuk tamu yang ingin suasana santai namun tetap dekat dengan semua kebutuhan.'
        ]
      },
      {
        heading: 'Fasilitas Homestay yang Lengkap',
        paragraphs: [
          'Setiap kamar dilengkapi AC, WiFi gratis, TV Android 32 inch, kamar mandi dalam dengan shower, handuk bersih, amenities, spring bed nyaman, serta dinding kedap suara untuk istirahat yang tenang.',
          'Tamu juga mendapatkan air mineral, kopi, dan teh gratis setiap hari. Area parkir luas tersedia untuk tamu yang membawa kendaraan pribadi atau operasional.'
        ]
      },
      {
        heading: 'Ideal untuk Berbagai Kebutuhan',
        paragraphs: [
          'Homestay Wisma Apollo cocok untuk tamu dinas yang butuh istirahat setelah agenda kerja, keluarga yang berkunjung ke Gunung Mas, pekerja lapangan, wisatawan, atau tamu transit yang butuh tempat menginap cepat dan praktis.',
          'Reservasi mudah melalui WhatsApp. Cukup kirim nama, tanggal check-in, tipe kamar, dan jumlah tamu. Admin akan segera merespons untuk konfirmasi ketersediaan.'
        ]
      }
    ],
    priceHeading: 'Harga Homestay Wisma Apollo',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' },
      { type: 'Sarapan by request', price: '+Rp25.000/pack' }
    ],
    priceNote: 'Harga sudah termasuk fasilitas kamar lengkap dan minuman gratis harian.',
    galleryHeading: 'Foto Homestay Wisma Apollo',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Homestay Kuala Kurun - Tampak depan Wisma Apollo' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Homestay Kuala Kurun - Fasilitas kamar' },
      { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Homestay Kuala Kurun - Kamar single bed' }
    ],
    faqs: [
      {
        q: 'Apakah Wisma Apollo termasuk homestay?',
        a: 'Ya, Wisma Apollo memberikan pengalaman menginap seperti homestay dengan suasana tenang dan personal, namun dilengkapi fasilitas setara hotel: AC, WiFi, TV Android, kamar mandi dalam, dan parkir.'
      },
      {
        q: 'Bagaimana cara booking homestay Wisma Apollo?',
        a: 'Reservasi bisa langsung melalui WhatsApp di 0818 232 021. Kirim nama, tanggal check-in, tipe kamar, dan jumlah tamu.'
      },
      {
        q: 'Apakah ada parkir di homestay ini?',
        a: 'Ya, tersedia area parkir luas dan aman di dalam pekarangan Wisma Apollo untuk mobil maupun motor.'
      }
    ]
  },
  'staycation-kuala-kurun': {
    title: 'Staycation Kuala Kurun - Wisma Apollo',
    seoTitle: 'Staycation Kuala Kurun - Wisma Apollo | Mulai Rp200.000/Malam',
    subtitle: 'Nikmati staycation nyaman di pusat kota Kuala Kurun',
    meta: 'Staycation di Kuala Kurun yang nyaman dan menyenangkan. Wisma Apollo menawarkan kamar bersih, AC, WiFi gratis, TV Android 32 inch, dan suasana tenang. Harga mulai Rp200.000/malam.',
    sections: [
      {
        heading: 'Staycation di Kuala Kurun',
        paragraphs: [
          'Butuh refreshing tanpa harus jauh? Wisma Apollo menawarkan pengalaman staycation yang nyaman di pusat Kuala Kurun. Nikmati kasur nyaman, AC dingin, TV Android 32 inch, WiFi gratis, dan suasana kamar yang bersih.',
          'Staycation di Wisma Apollo cocok untuk pasangan, keluarga kecil, atau siapa saja yang ingin melepas penat tanpa perjalanan jauh. Cukup pesan kamar, check-in, dan nikmati waktu istirahatmu.'
        ]
      },
      {
        heading: 'Apa yang Bisa Dilakukan Saat Staycation?',
        paragraphs: [
          'Nikmati nonton film atau serial di TV Android 32 inch yang tersedia di kamar. Browsing internet dengan WiFi gratis yang stabil. Istirahat di kasur spring bed yang empuk dengan bantal bulu angsa.',
          'Saat sore atau malam, jalan-jalan ke cafe terdekat, nikmati kuliner lokal Kuala Kurun, atau sekadar duduk santai di area sekitar penginapan. Semua bisa dilakukan tanpa perjalanan jauh karena lokasi Wisma Apollo di pusat kota.'
        ]
      },
      {
        heading: 'Lokasi Strategis untuk Staycation',
        paragraphs: [
          'Wisma Apollo berada di Jl. Letjen Soeprapto No.56, Kuala Kurun. Dari sini, tamu bisa berjalan kaki ke berbagai cafe, warung makan, minimarket, dan area taman kota. Lokasi yang praktis membuat staycation terasa lebih menyenangkan.',
          'Setelah menjelajah kota, kembali ke kamar yang sejuk dan tenang. Dengan dinding kedap suara, istirahat malam dijamin tidak terganggu.'
        ]
      }
    ],
    priceHeading: 'Harga Kamar Staycation',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' }
    ],
    priceNote: 'Harga sudah termasuk AC, WiFi, TV Android, air mineral, kopi, dan teh. Cocok untuk staycation singkat maupun beberapa malam.',
    galleryHeading: 'Suasana Staycation di Wisma Apollo',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Staycation Kuala Kurun - Wisma Apollo' },
      { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Staycation Kuala Kurun - Kamar double bed' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Staycation Kuala Kurun - Fasilitas kamar' }
    ],
    faqs: [
      {
        q: 'Apakah Wisma Apollo cocok untuk staycation?',
        a: 'Sangat cocok. Kamar dilengkapi TV Android 32 inch, WiFi gratis, AC, kasur nyaman, dan suasana tenang. Lokasi di pusat kota juga memudahkan tamu mencari kuliner dan hiburan.'
      },
      {
        q: 'Berapa harga staycation di Wisma Apollo?',
        a: 'Harga mulai Rp200.000 per malam untuk Single Bed dan Rp250.000 per malam untuk Double Bed.'
      },
      {
        q: 'Apakah bisa menginap lebih dari satu malam untuk staycation?',
        a: 'Tentu, tamu bisa menginap berapa malam pun sesuai ketersediaan. Hubungi admin via WhatsApp untuk booking beberapa malam.'
      }
    ]
  },
  'tempat-istirahat-kuala-kurun': {
    title: 'Tempat Istirahat Kuala Kurun - Wisma Apollo',
    seoTitle: 'Tempat Istirahat Kuala Kurun - Wisma Apollo | Kamar Kedap Suara Rp200.000',
    subtitle: 'Tempat istirahat nyaman di Kuala Kurun, Gunung Mas',
    meta: 'Tempat istirahat nyaman di Kuala Kurun dengan kamar bersih, kedap suara, AC, WiFi gratis, dan parkir luas. Wisma Apollo, harga mulai Rp200.000/malam di pusat kota Gunung Mas.',
    sections: [
      {
        heading: 'Tempat Istirahat Ideal di Kuala Kurun',
        paragraphs: [
          'Setelah perjalanan panjang atau hari kerja yang melelahkan, Wisma Apollo menyediakan tempat istirahat yang bersih dan nyaman di pusat Kuala Kurun. Kamar tenang, fasilitas lengkap, dan harga terjangkau membuatnya layak dipertimbangkan.',
          'Berlokasi di Jl. Letjen Soeprapto No.56, Wisma Apollo mudah dijangkau dari jalan utama Kuala Kurun. Tamu bisa langsung check-in, mandi, dan beristirahat tanpa perlu mencari-cari.'
        ]
      },
      {
        heading: 'Kamar Kedap Suara untuk Tidur Berkualitas',
        paragraphs: [
          'Fitur unggulan Wisma Apollo adalah dinding dan plafon kedap suara. Di harga Rp200.000/malam, fitur ini sangat langka. Tamu bisa tidur nyenyak tanpa terganggu oleh suara dari luar kamar.',
          'Ditambah dengan kasur spring bed, bantal bulu angsa, AC dingin, dan sprei katun bersih, kualitas tidur di Wisma Apollo setara dengan hotel berbintang.'
        ]
      },
      {
        heading: 'Cocok untuk Transit dan Perjalanan Dinas',
        paragraphs: [
          'Banyak tamu datang ke Kuala Kurun untuk urusan kerja, dinas pemerintahan, atau transit sebelum melanjutkan perjalanan. Wisma Apollo menyediakan tempat istirahat yang praktis: proses check-in cepat via WhatsApp, kamar siap pakai, dan fasilitas lengkap.',
          'Untuk tamu yang hanya butuh satu malam, Wisma Apollo memberikan pengalaman istirahat yang optimal. Bangun pagi dengan segar, siap menjalani agenda hari berikutnya.'
        ]
      }
    ],
    priceHeading: 'Harga Tempat Istirahat',
    priceRows: [
      { type: 'Single Bed', price: 'Mulai Rp200.000/malam' },
      { type: 'Double Bed', price: 'Mulai Rp250.000/malam' },
      { type: 'Extra Bed + Bantal', price: '+Rp50.000' },
      { type: 'Sarapan by request', price: '+Rp25.000/pack' }
    ],
    priceNote: 'Semua kamar dilengkapi dinding kedap suara, AC, WiFi gratis, TV Android, kamar mandi dalam, dan amenities.',
    galleryHeading: 'Foto Wisma Apollo Kuala Kurun',
    gallery: [
      { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Tempat Istirahat Kuala Kurun - Wisma Apollo' },
      { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Tempat Istirahat Kuala Kurun - Kamar single bed' },
      { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Tempat Istirahat Kuala Kurun - Kamar double bed' },
      { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Tempat Istirahat Kuala Kurun - Fasilitas kamar' }
    ],
    faqs: [
      {
        q: 'Apakah kamar di Wisma Apollo benar-benar kedap suara?',
        a: 'Ya, dinding dan plafon kamar dirancang dengan peredam suara untuk memastikan tamu bisa tidur dengan tenang tanpa gangguan kebisingan dari luar.'
      },
      {
        q: 'Apakah cocok untuk menginap satu malam saja?',
        a: 'Sangat cocok. Banyak tamu transit atau dinas yang menginap satu malam di Wisma Apollo. Proses check-in cepat dan kamar langsung siap digunakan.'
      },
      {
        q: 'Jam berapa check-in dan check-out?',
        a: 'Check-in mulai pukul 14.00 WITA dan check-out pukul 12.00 WITA. Untuk kebutuhan early check-in atau late check-out, hubungi admin via WhatsApp.'
      }
    ]
  }
}

const isSupportedPageSlug = (candidate: string) => {
  if (!candidate || candidate.includes('/') || candidate.includes('.')) {
    return false
  }

  if (fallbackPages[candidate]) {
    return true
  }

  return Object.entries(messagesByLocale).some(([localeCode, rawMessages]) => {
    const messages = resolveLocaleMessages(rawMessages, localeCode)
    return Boolean((messages.pages as Record<string, any> | undefined)?.[candidate])
  })
}

if (!isSupportedPageSlug(slug.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Halaman tidak ditemukan',
    fatal: true,
  })
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
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      relatedHeading: String(data.relatedHeading || ''),
      relatedLinks: Array.isArray(data.relatedLinks) ? data.relatedLinks : []
    }
  }

  if (fallbackPages[currentSlug]) {
    return fallbackPages[currentSlug]
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Halaman tidak ditemukan',
    fatal: true,
  })
})

const pageUrl = computed(() => {
  const localePrefix = locale.value === 'id' ? '' : `/${locale.value}`
  return `${siteUrl}${localePrefix}/${slug.value}/`
})

const homeUrl = computed(() => {
  const localePrefix = locale.value === 'id' ? '' : `/${locale.value}`
  return `${siteUrl}${localePrefix}/`
})

const pageTitle = computed(() => pageData.value.seoTitle || pageData.value.title || 'Wisma Apollo Kuala Kurun')
const pageDescription = computed(() => pageData.value.meta || pageData.value.subtitle || 'Wisma Apollo adalah hotel dan penginapan nyaman di Kuala Kurun, Gunung Mas, Kalimantan Tengah.')
const pageImage = computed(() => {
  const image = pageData.value.gallery?.[0]?.src || '/images/hero.webp'
  return image.startsWith('http') ? image : `${siteUrl}${image}`
})

const pageLanguage = computed(() => locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID')
const priceFallbackHeading = computed(() => locale.value === 'en' ? 'Room Rates' : 'Harga Kamar')
const roomTypeLabel = computed(() => locale.value === 'en' ? 'Room Type' : 'Tipe Kamar')
const priceLabel = computed(() => locale.value === 'en' ? 'Rate' : 'Harga')
const faqHeading = computed(() => locale.value === 'en'
  ? `Questions About ${pageData.value.title}`
  : `Pertanyaan Seputar ${pageData.value.title}`)
const relatedFallbackHeading = computed(() => locale.value === 'en' ? 'Related Guides' : 'Panduan Terkait')

const pageStructuredData = computed(() => {
  const schemaItems: any[] = [
    buildWebPageSchema({
      url: pageUrl.value,
      name: pageTitle.value,
      description: pageDescription.value,
      image: pageImage.value,
      inLanguage: pageLanguage.value,
    }),
    buildBreadcrumbSchema([
      { name: 'Wisma Apollo Kuala Kurun', url: homeUrl.value },
      { name: pageData.value.title, url: pageUrl.value },
    ]),
  ]

  if (pageData.value.faqs?.length) {
    schemaItems.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl.value}#faq`,
      mainEntity: pageData.value.faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    })
  }

  return buildGraphSchema(schemaItems)
})

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogType: 'website',
  ogUrl: () => pageUrl.value,
  ogImage: () => pageImage.value,
  ogImageAlt: () => pageTitle.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
  twitterImage: () => pageImage.value,
  twitterImageAlt: () => pageTitle.value,
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: pageUrl.value },
    ...buildHreflangLinks(`/${slug.value}`, ['id', 'en']),
  ],
  meta: [
    { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
    { property: 'og:locale', content: locale.value === 'id' ? 'id_ID' : locale.value === 'zh' ? 'zh_CN' : 'en_US' },
    { property: 'og:image:secure_url', content: pageImage.value },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
  ],
  script: [
    {
      type: 'application/ld+json',
      textContent: JSON.stringify(pageStructuredData.value),
    },
  ],
}))

useScrollAnimation()
</script>
