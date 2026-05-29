<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="lp-back lp-back-light">← {{ $t('common.backHome') }}</NuxtLink>
        <h1>{{ $t('blog.title') }}</h1>
        <p>{{ $t('blog.desc') }}</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div v-if="locale === 'en'" class="blog-intro">
          <span class="blog-intro-kicker">Kuala Kurun Travel Guide</span>
          <h2>Accommodation, Food, and Travel Notes for Gunung Mas Visitors</h2>
          <p>
            This blog collects practical guides for travelers who plan to stay in Kuala Kurun, the capital of Gunung Mas Regency.
            You can find hotel recommendations, local food references, nearby attractions, and simple tips for choosing a clean,
            strategic place to rest after a long road trip or work agenda.
          </p>
          <p>
            Wisma Apollo is located on Jl. Letjen Soeprapto No.56, close to the city center, local cafes, government offices, and
            everyday needs. Use these articles as a starting point, then contact our team via WhatsApp to check room availability,
            current rates, and the best room type for your schedule.
          </p>
        </div>

        <!-- Debug Info -->
        <div v-if="pending" style="text-align: center; padding: 40px;">Memuat artikel...</div>
        
        <div v-else-if="articles && articles.length" class="blog-grid" role="list">
          <NuxtLink
            v-for="(post, i) in articles"
            :key="i"
            :to="localePath('/blog/' + ((post as any).path?.split('/').pop() || ''))"
            class="blog-card"
            role="listitem"
          >
            <NuxtImg
              :src="(post as any).image || '/images/hero.webp'"
              :alt="(post as any).title"
              width="480"
              height="180"
              loading="lazy"
            />
            <div class="blog-card-body">
              <div class="blog-card-meta">
                <span class="blog-card-tag">{{ (post as any).category }}</span>
                <time v-if="(post as any).date" :datetime="(post as any).date">{{ formatBlogDate((post as any).date) }}</time>
              </div>
              <h3>{{ (post as any).title }}</h3>
              <p>{{ (post as any).description || (post as any).excerpt }}</p>
              <span class="read-more">{{ $t('common.readMore') }}</span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else style="padding: 60px 0; text-align: center; color: var(--text2);">
          <p>{{ locale === 'id' ? 'Belum ada artikel untuk bahasa ini.' : 'No articles available for this language.' }}</p>
        </div>

        <div v-if="locale === 'en'" class="blog-cta" id="reservation">
          <div>
            <span>Need a room in Kuala Kurun?</span>
            <h2>Reserve Wisma Apollo directly via WhatsApp</h2>
            <p>
              Fill in the short reservation form to send your stay dates, guest count, room type, and notes to our admin.
              We will help confirm availability before your arrival.
            </p>
          </div>
          <button type="button" class="blog-cta-btn" @click="bookingStore.openModal()">
            Reserve Now
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

const { locale } = useI18n()
const localePath = useLocalePath()
const bookingStore = useBookingStore()
const siteUrl = SITE_URL
const isIndexableBlog = computed(() => locale.value !== 'zh')

if (locale.value === 'zh') {
  await navigateTo('/zh/', { redirectCode: 301 })
}

const localePrefix = computed(() => locale.value === 'id' ? '' : `/${locale.value}`)
const homeUrl = computed(() => `${siteUrl}${localePrefix.value}/`)
const blogUrl = computed(() => `${siteUrl}${localePrefix.value}/blog/`)
const blogLanguage = computed(() => locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-US' : 'id-ID')

const blogTitle = computed(() => locale.value === 'id'
  ? 'Blog Wisma Apollo Kuala Kurun | Tips Menginap & Wisata'
  : 'Wisma Apollo Kuala Kurun Blog | Travel Tips & Tourism')

const blogDescription = computed(() => locale.value === 'id'
  ? 'Tips menginap, wisata, dan kuliner di Kuala Kurun & Gunung Mas, Kalimantan Tengah.'
  : 'Accommodation tips, tourism, and culinary guides for Kuala Kurun & Gunung Mas, Central Kalimantan.')

const blogImage = `${siteUrl}/images/hero.webp`
const formatBlogDate = (date?: string) => {
  if (!date) return ''

  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
const blogStructuredData = computed(() => buildGraphSchema([
  buildWebPageSchema({
    url: blogUrl.value,
    name: blogTitle.value,
    description: blogDescription.value,
    image: blogImage,
    inLanguage: blogLanguage.value,
  }),
  buildBreadcrumbSchema([
    { name: 'Wisma Apollo Kuala Kurun', url: homeUrl.value },
    { name: 'Blog Wisma Apollo', url: blogUrl.value },
  ]),
  {
    '@type': 'CollectionPage',
    '@id': `${blogUrl.value}#collection`,
    name: blogTitle.value,
    description: blogDescription.value,
    url: blogUrl.value,
    inLanguage: blogLanguage.value,
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (articles.value || []).map((post: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${blogUrl.value}${post.path?.split('/').pop() || ''}/`,
      })),
    },
  },
]))

const { data: articles, pending, refresh } = await useAsyncData(`articles-${locale.value}`, async () => {
  const all = await queryCollection('content').all()
  return all.filter(a => a.path.startsWith(`/${locale.value}/blog/`))
})

watch(locale, () => {
  refresh()
})

useSeoMeta({
  title: () => blogTitle.value,
  description: () => blogDescription.value,
  ogTitle: () => blogTitle.value,
  ogDescription: () => blogDescription.value,
  ogType: 'website',
  ogUrl: () => blogUrl.value,
  ogImage: blogImage,
  ogImageAlt: 'Wisma Apollo Kuala Kurun',
  twitterCard: 'summary_large_image',
  twitterTitle: () => blogTitle.value,
  twitterDescription: () => blogDescription.value,
  twitterImage: blogImage,
  twitterImageAlt: 'Wisma Apollo Kuala Kurun',
  robots: () => isIndexableBlog.value ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: blogUrl.value },
    ...buildHreflangLinks('/blog', ['id', 'en']),
  ],
  meta: [
    { property: 'og:site_name', content: 'Wisma Apollo Kuala Kurun' },
    { property: 'og:locale', content: locale.value === 'id' ? 'id_ID' : locale.value === 'zh' ? 'zh_CN' : 'en_US' },
    { property: 'og:image:secure_url', content: blogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
  ],
  script: [
    {
      type: 'application/ld+json',
      textContent: JSON.stringify(blogStructuredData.value),
    },
  ],
}))
</script>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
.blog-card {
  background: var(--bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  border: 1px solid var(--border);
}
.blog-card:hover {
  transform: translateY(-5px);
}
.blog-card-body {
  padding: 20px;
}
.blog-card-tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 12px;
}
.blog-card h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--text);
}
.blog-card p {
  font-size: 0.9rem;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.read-more {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
