<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="lp-back lp-back-light">&lt;- {{ $t('common.backHome') }}</NuxtLink>
        <h1>{{ $t('faq.pageTitle') }}</h1>
        <p>{{ $t('faq.pageDesc') }}</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="faq-list" role="list">
          <div v-for="i in faqItemCount" :key="i" class="faq-item" role="listitem">
            <button
              class="faq-question"
              :aria-expanded="openIndex === i - 1"
              :aria-controls="'faq-answer-' + (i - 1)"
              @click="toggle(i - 1)"
            >
              <span>{{ $t(`faq.items[${i-1}].q`) }}</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div
              :id="'faq-answer-' + (i - 1)"
              class="faq-answer"
              role="region"
              :aria-hidden="openIndex !== i - 1"
              v-show="openIndex === i - 1"
            >
              <div class="faq-answer-inner">{{ $t(`faq.items[${i-1}].a`) }}</div>
            </div>
          </div>
        </div>

        <div style="margin: 40px auto 0; text-align: center; max-width: 760px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 10px;">{{ $t('faq.stillQuestion') }}</h3>
          <p class="desc">{{ $t('faq.contactUs') }}</p>
          <a
            :href="`https://wa.me/62818232021?text=${encodeURIComponent($t('common.waDefault'))}`"
            target="_blank"
            rel="noopener"
            class="btn-wa faq-wa-desktop"
            style="max-width: 300px; margin: 16px auto 0;"
            @click="trackFaqContact"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {{ $t('faq.chatWa') }}
          </a>
          <button
            type="button"
            class="btn-wa faq-wa-mobile"
            style="max-width: 300px; margin: 16px auto 0;"
            @click="openFaqBookingForm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 5v11h10V8H7Zm2-5v2h6V3h2v2h1v2H6V5h1V3h2Zm0 7h2v2H9v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2H9v-2Zm4 0h2v2h-2v-2Z" />
            </svg>
            {{ $t('nav.reserve') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  SITE_URL,
  buildBreadcrumbSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from '~/composables/useSitelinkSchema'
import { useBookingStore } from '~/stores/useBookingStore'

const openIndex = ref<number | null>(null)
const { locale, t, tm } = useI18n()
const localePath = useLocalePath()
const siteUrl = SITE_URL
const bookingStore = useBookingStore()
const faqItemCount = computed(() => {
  const items = tm('faq.items')
  return Array.isArray(items) ? items.length : 8
})

const homeUrl = computed(() => {
  const localePrefix = locale.value === 'id' ? '' : `/${locale.value}`
  return `${siteUrl}${localePrefix}/`
})

const faqUrl = computed(() => {
  const localePrefix = locale.value === 'id' ? '' : `/${locale.value}`
  return `${siteUrl}${localePrefix}/faq`
})

const faqTitle = computed(() => {
  if (locale.value === 'en') return 'FAQ - Wisma Apollo Kuala Kurun'
  if (locale.value === 'zh') return '常见问题 - Wisma Apollo Kuala Kurun'
  return 'FAQ - Wisma Apollo Kuala Kurun'
})

const faqDescription = computed(() => {
  if (locale.value === 'en') return 'Find answers about Wisma Apollo location, room rates, facilities, check-in rules, and reservation steps in Kuala Kurun.'
  if (locale.value === 'zh') return '了解 Wisma Apollo Kuala Kurun 的位置、房价、客房设施、入住规则、停车信息以及通过 WhatsApp 预订住宿的方式。'
  return 'Temukan jawaban tentang lokasi Wisma Apollo, tarif kamar, fasilitas, aturan check-in, dan cara reservasi di Kuala Kurun.'
})

const faqImage = `${siteUrl}/images/hero.webp`
const faqLanguage = computed(() => locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID')
const faqStructuredData = computed(() => buildGraphSchema([
  buildWebPageSchema({
    url: faqUrl.value,
    name: faqTitle.value,
    description: faqDescription.value,
    image: faqImage,
    inLanguage: faqLanguage.value,
  }),
  buildBreadcrumbSchema([
    { name: 'Wisma Apollo Kuala Kurun', url: homeUrl.value },
    { name: 'FAQ Wisma Apollo', url: faqUrl.value },
  ]),
  {
    '@type': 'FAQPage',
    '@id': `${faqUrl.value}#faq`,
    mainEntity: Array.from({ length: faqItemCount.value }, (_, index) => ({
      '@type': 'Question',
      name: t(`faq.items[${index}].q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.items[${index}].a`),
      },
    })),
  },
]))

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

function openFaqBookingForm() {
  bookingStore.openModal()
}

function trackFaqContact() {
  useTracking().trackContact('faq_whatsapp')
}

useSeoMeta({
  title: () => faqTitle.value,
  description: () => faqDescription.value,
  ogTitle: () => faqTitle.value,
  ogDescription: () => faqDescription.value,
  ogType: 'website',
  ogUrl: () => faqUrl.value,
  ogImage: faqImage,
  ogImageAlt: 'Wisma Apollo Kuala Kurun',
  twitterCard: 'summary_large_image',
  twitterTitle: () => faqTitle.value,
  twitterDescription: () => faqDescription.value,
  twitterImage: faqImage,
  twitterImageAlt: 'Wisma Apollo Kuala Kurun',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: faqUrl.value },
    ...buildHreflangLinks('/faq', ['id', 'en', 'zh']),
  ],
  meta: [
    { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
    { property: 'og:locale', content: locale.value === 'id' ? 'id_ID' : locale.value === 'zh' ? 'zh_CN' : 'en_US' },
    { property: 'og:image:secure_url', content: faqImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
  ],
  script: [
    {
      type: 'application/ld+json',
      textContent: JSON.stringify(faqStructuredData.value),
    },
  ],
}))

useScrollAnimation()
</script>
