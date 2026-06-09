<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <a :href="canonicalPath('/blog/')" class="lp-back lp-back-light">&lt;- {{ $t('nav.blog') }}</a>
        <h1>{{ article?.title || 'Article' }}</h1>
        <p v-if="article" class="article-meta-line">
          {{ articleAuthorLabel }} - {{ publishedLabel }} {{ formatArticleDate((article as any).date) }}
          <span v-if="(article as any).dateModified && (article as any).dateModified !== (article as any).date">
            - {{ updatedLabel }} {{ formatArticleDate((article as any).dateModified) }}
          </span>
        </p>
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
          <p>{{ articleUnavailableText }}</p>
          <a :href="canonicalPath('/blog/')" class="lp-back" style="margin-top: 16px;">&lt;- {{ backToBlogText }}</a>
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
const canonicalPath = useCanonicalLocalePath()
const bookingStore = useBookingStore()
const siteUrl = SITE_URL
const isIndexableBlog = computed(() => locale.value !== 'zh')

if (locale.value === 'zh') {
  await navigateTo('/zh/', { redirectCode: 301 })
}
const localePrefix = computed(() => locale.value === 'id' ? '' : `/${locale.value}`)
const homeUrl = computed(() => `${siteUrl}${localePrefix.value}/`)
const blogUrl = computed(() => `${siteUrl}${localePrefix.value}/blog/`)
const articleLanguage = computed(() => locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID')

const { data: article } = await useAsyncData(`article-view-${locale.value}-${slug}`, async () => {
  return await queryCollection('content').path(`/${locale.value}/blog/${slug}`).first()
}, { watch: [locale], default: () => null })

const articleUrl = computed(() => {
  const articlePath = (article.value as any)?.path

  if (articlePath) {
    const [, , articleSlug] = articlePath.match(/^\/([^/]+)\/blog\/(.+)$/) || []
    return `${blogUrl.value}${articleSlug || slug}/`
  }

  return `${blogUrl.value}${slug}/`
})

const articleTitle = computed(() => article.value?.title || 'Blog Wisma Apollo Kuala Kurun')
const articleSeoTitle = computed(() => {
  const title = articleTitle.value
  return locale.value === 'en'
    ? `Travel Guide: ${title}`
    : `Panduan Wisma Apollo: ${title}`
})
const articleDescription = computed(() => article.value?.description || article.value?.excerpt || (locale.value === 'en'
  ? 'Wisma Apollo Kuala Kurun articles about accommodation, travel, and culinary destinations in Gunung Mas.'
  : 'Artikel Wisma Apollo Kuala Kurun seputar penginapan, wisata, dan kuliner di Gunung Mas.'))
const articleUnavailableText = computed(() => locale.value === 'en'
  ? 'Article is loading or not yet available.'
  : 'Artikel sedang dimuat atau belum tersedia.')
const backToBlogText = computed(() => locale.value === 'en' ? 'Back to Blog' : 'Kembali ke Blog')
const fallbackArticleAuthor = computed(() => locale.value === 'en' ? 'Wisma Apollo Editorial Team' : 'Tim Wisma Apollo')
const articleAuthorLabel = computed(() => (article.value as any)?.author || fallbackArticleAuthor.value)
const publishedLabel = computed(() => locale.value === 'en' ? 'Published' : 'Terbit')
const updatedLabel = computed(() => locale.value === 'en' ? 'Updated' : 'Diperbarui')
const articleImage = computed(() => {
  const image = (article.value as any)?.image || '/images/hero.webp'
  return image.startsWith('http') ? image : `${siteUrl}${image}`
})

const formatArticleDate = (date?: string) => {
  if (!date) return locale.value === 'en' ? 'not dated' : 'tanpa tanggal'

  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

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
        datePublished: (article.value as any)?.date || undefined,
        dateModified: (article.value as any)?.dateModified || (article.value as any)?.date || undefined,
        author: {
          '@type': 'Organization',
          name: articleAuthorLabel.value,
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
  title: () => articleSeoTitle.value,
  description: () => articleDescription.value,
  ogTitle: () => articleSeoTitle.value,
  ogDescription: () => articleDescription.value,
  ogType: 'article',
  ogUrl: () => articleUrl.value,
  ogImage: () => articleImage.value,
  ogImageAlt: () => articleTitle.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => articleSeoTitle.value,
  twitterDescription: () => articleDescription.value,
  twitterImage: () => articleImage.value,
  twitterImageAlt: () => articleTitle.value,
  robots: () => isIndexableBlog.value ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: articleUrl.value },
    ...buildHreflangLinks(`/blog/${slug}`, ['id', 'en']),
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
      textContent: JSON.stringify(articleStructuredData.value),
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
