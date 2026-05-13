<template>
  <div>
    <HeroSection />
    <PromoStrip />
    <AboutSection />
    <FacilitiesSection />
    <RoomCards />
    <GallerySection />
    <TestimonialSection />
    <MapSection />
  </div>
</template>

<script setup lang="ts">
import {
  SITE_URL,
  buildBreadcrumbSchema,
  buildGraphSchema,
  buildHotelSchema,
  buildOrganizationSchema,
  buildSiteNavigationSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
} from '~/composables/useSitelinkSchema'

const tracking = useTracking()
const { locale } = useI18n()
const siteUrl = SITE_URL

const homeUrl = computed(() => {
  const localePrefix = locale.value === 'id' ? '' : `/${locale.value}`
  return `${siteUrl}${localePrefix}/`
})

const homeTitle = computed(() => {
  if (locale.value === 'en') return 'Wisma Apollo - Hotel & Lodging in Kuala Kurun'
  if (locale.value === 'zh') return 'Wisma Apollo - Kuala Kurun 酒店与住宿'
  return 'Wisma Apollo - Hotel & Penginapan Kuala Kurun'
})

const homeDescription = computed(() => {
  if (locale.value === 'en') return 'Wisma Apollo is a clean and strategic hotel in Kuala Kurun with AC rooms, free WiFi, Android TV, private bathroom, and spacious parking.'
  if (locale.value === 'zh') return 'Wisma Apollo 是 Kuala Kurun 干净便利的住宿选择，提供空调客房、免费 WiFi、Android 电视、独立浴室和宽敞停车区。'
  return 'Wisma Apollo adalah hotel dan penginapan Kuala Kurun yang bersih, strategis, dan nyaman dengan AC, WiFi gratis, TV Android, dan parkir luas.'
})

const homeImage = `${siteUrl}/images/hero.webp`

onMounted(() => {
  tracking.initLandingTracking()
})

useSeoMeta({
  title: () => homeTitle.value,
  description: () => homeDescription.value,
  ogTitle: () => homeTitle.value,
  ogDescription: () => homeDescription.value,
  ogType: 'website',
  ogUrl: () => homeUrl.value,
  ogImage: homeImage,
  ogImageAlt: 'Tampak depan Wisma Apollo Kuala Kurun',
  twitterCard: 'summary_large_image',
  twitterTitle: () => homeTitle.value,
  twitterDescription: () => homeDescription.value,
  twitterImage: homeImage,
  twitterImageAlt: 'Tampak depan Wisma Apollo Kuala Kurun',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: homeUrl.value },
  ],
  meta: [
    { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
    { property: 'og:locale', content: locale.value === 'id' ? 'id_ID' : locale.value === 'zh' ? 'zh_CN' : 'en_US' },
    { property: 'og:image:secure_url', content: homeImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildGraphSchema([
        buildOrganizationSchema(),
        buildHotelSchema(),
        buildWebsiteSchema(locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID'),
        buildSiteNavigationSchema(),
        buildWebPageSchema({
          url: homeUrl.value,
          name: homeTitle.value,
          description: homeDescription.value,
          image: homeImage,
          inLanguage: locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID',
        }),
        buildBreadcrumbSchema([
          { name: 'Wisma Apollo Kuala Kurun', url: `${siteUrl}/` },
        ]),
      ])),
    },
  ],
}))
</script>
