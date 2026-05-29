<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/blog')" class="lp-back lp-back-light">← {{ $t('nav.blog') }}</NuxtLink>
        <h1>{{ article?.title || 'Article' }}</h1>
      </div>
    </div>

    <div class="blog-article" @click="handleArticleClick">
      <div class="container">
        <template v-if="article">
          <NuxtImg
            v-if="(article as any).image"
            :src="(article as any).image"
            :alt="(article as any).title || 'Blog Wisma Apollo'"
            width="960"
            height="360"
            class="blog-hero-image"
            loading="eager"
          />
          <ContentRenderer :value="article" />
        </template>
        <div v-else style="padding: 40px 0; text-align: center; color: var(--text2);">
          <p>Artikel sedang dimuat atau belum tersedia.</p>
          <NuxtLink :to="localePath('/blog')" class="lp-back" style="margin-top: 16px;">← Kembali ke Blog</NuxtLink>
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

const route = useRoute()
const slug = route.params.slug as string

const { locale } = useI18n()
const localePath = useLocalePath()
const bookingStore = useBookingStore()
const siteUrl = SITE_URL
const isIdBlog = computed(() => locale.value === 'id')
const localePrefix = computed(() => locale.value === 'id' ? '' : `/${locale.value}`)
const homeUrl = computed(() => `${siteUrl}${localePrefix.value}/`)
const blogUrl = computed(() => `${siteUrl}${localePrefix.value}/blog`)
const articleLanguage = computed(() => locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID')

const { data: article } = await useAsyncData(`article-view-${locale.value}-${slug}`, async () => {
  return await queryCollection('content').path(`/id/blog/${slug}`).first()
}, { watch: [locale], default: () => null })

const articleUrl = computed(() => {
  const articlePath = (article.value as any)?.path

  if (articlePath) {
    const [, , articleSlug] = articlePath.match(/^\/([^/]+)\/blog\/(.+)$/) || []
    return `${blogUrl.value}/${articleSlug || slug}`
  }

  return `${blogUrl.value}/${slug}`
})

const articleTitle = computed(() => article.value?.title || 'Blog Wisma Apollo Kuala Kurun')
const articleDescription = computed(() => article.value?.description || article.value?.excerpt || 'Artikel Wisma Apollo Kuala Kurun seputar penginapan, wisata, dan kuliner di Gunung Mas.')
const articleImage = computed(() => {
  const image = (article.value as any)?.image || '/images/hero.webp'
  return image.startsWith('http') ? image : `${siteUrl}${image}`
})

const articleStructuredData = computed(() => buildGraphSchema([
  buildWebPageSchema({
    url: articleUrl.value,
    name: articleTitle.value,
    description: articleDescription.value,
    image: articleImage.value,
    inLanguage: articleLanguage.value,
  }),
  buildBreadcrumbSchema([
    { name: 'Wisma Apollo Kuala Kurun', url: homeUrl.value },
    { name: 'Blog Wisma Apollo', url: blogUrl.value },
    { name: articleTitle.value, url: articleUrl.value },
  ]),
  article.value
    ? {
        '@type': 'BlogPosting',
        '@id': `${articleUrl.value}#article`,
        headline: articleTitle.value,
        description: articleDescription.value,
        image: articleImage.value,
        mainEntityOfPage: { '@id': `${articleUrl.value}#webpage` },
        url: articleUrl.value,
        inLanguage: articleLanguage.value,
        author: {
          '@type': 'Organization',
          name: 'Wisma Apollo Kuala Kurun',
          url: `${siteUrl}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Wisma Apollo Kuala Kurun',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/images/logo/wisma-apollo-logo.png`,
          },
        },
      }
    : null,
]))

const handleArticleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  const trigger = target?.closest('[data-booking-trigger="true"]')

  if (!trigger) return

  event.preventDefault()
  bookingStore.openModal()
}

useSeoMeta({
  title: () => articleTitle.value,
  description: () => articleDescription.value,
  ogTitle: () => articleTitle.value,
  ogDescription: () => articleDescription.value,
  ogType: 'article',
  ogUrl: () => articleUrl.value,
  ogImage: () => articleImage.value,
  ogImageAlt: () => articleTitle.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => articleTitle.value,
  twitterDescription: () => articleDescription.value,
  twitterImage: () => articleImage.value,
  twitterImageAlt: () => articleTitle.value,
  robots: () => isIdBlog.value ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: articleUrl.value },
  ],
  meta: [
    { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
    { property: 'og:locale', content: locale.value === 'id' ? 'id_ID' : locale.value === 'zh' ? 'zh_CN' : 'en_US' },
    { property: 'og:image:secure_url', content: articleImage.value },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(articleStructuredData.value),
    },
  ],
}))
</script>

<style scoped>
.blog-hero-image {
  width: 100%;
  aspect-ratio: 8 / 3;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 0 28px;
}
</style>
