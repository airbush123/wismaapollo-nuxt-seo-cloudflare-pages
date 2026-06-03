<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <a :href="canonicalPath('/')" class="lp-back lp-back-light">← {{ $t('common.backHome') }}</a>
        <h1>{{ $t('blog.title') }}</h1>
        <p>{{ $t('blog.desc') }}</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="blog-intro">
          <span class="blog-intro-kicker">{{ blogPageCopy.intro.kicker }}</span>
          <h2>{{ blogPageCopy.intro.title }}</h2>
          <div class="blog-intro-copy">
            <p v-for="paragraph in blogPageCopy.intro.paragraphs" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <div v-if="pending" class="blog-empty">{{ blogPageCopy.loading }}</div>
        
        <div v-else-if="articles && articles.length" class="blog-grid" role="list">
          <a
            v-for="(post, i) in articles"
            :key="i"
            :href="canonicalPath('/blog/' + ((post as any).path?.split('/').pop() || '') + '/')"
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
          </a>
        </div>
        
        <div v-else class="blog-empty">
          <p>{{ blogPageCopy.empty }}</p>
        </div>

        <div class="blog-cta" id="reservation">
          <div>
            <span>{{ blogPageCopy.cta.kicker }}</span>
            <h2>{{ blogPageCopy.cta.title }}</h2>
            <p>{{ blogPageCopy.cta.desc }}</p>
          </div>
          <button type="button" class="blog-cta-btn" @click="bookingStore.openModal()">
            {{ blogPageCopy.cta.button }}
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
const canonicalPath = useCanonicalLocalePath()
const bookingStore = useBookingStore()
const siteUrl = SITE_URL
const isIndexableBlog = computed(() => locale.value !== 'zh')
const blogCopyByLocale = {
  id: {
    intro: {
      kicker: 'Panduan Kuala Kurun',
      title: 'Tips Menginap, Kuliner, dan Wisata di Gunung Mas',
      paragraphs: [
        'Kumpulan artikel Wisma Apollo seputar hotel Kuala Kurun, penginapan Kuala Kurun, kuliner lokal, tempat wisata, dan tips perjalanan praktis untuk tamu yang datang ke Gunung Mas.',
        'Gunakan panduan ini untuk memilih tempat menginap yang bersih, strategis, dan mudah dipesan, lalu cek ketersediaan kamar Wisma Apollo langsung lewat form reservasi.',
      ],
    },
    cta: {
      kicker: 'Butuh kamar di Kuala Kurun?',
      title: 'Reservasi Wisma Apollo langsung dari website',
      desc: 'Isi form singkat untuk mengirim tanggal menginap, jumlah tamu, tipe kamar, dan catatan tambahan. Admin akan membantu cek ketersediaan kamar sebelum kedatangan.',
      button: 'Reservasi Sekarang',
    },
    loading: 'Memuat artikel...',
    empty: 'Belum ada artikel untuk bahasa ini.',
  },
  en: {
    intro: {
      kicker: 'Kuala Kurun Guide',
      title: 'Accommodation, Food, and Travel Notes for Gunung Mas Visitors',
      paragraphs: [
        'Wisma Apollo Blog collects practical guides for travelers looking for hotels, lodging, local food, nearby attractions, and simple travel tips around Kuala Kurun and Gunung Mas.',
        'Use these articles as a starting point to plan a clean, strategic stay, then check Wisma Apollo room availability directly through the reservation form.',
      ],
    },
    cta: {
      kicker: 'Need a room in Kuala Kurun?',
      title: 'Reserve Wisma Apollo directly from the website',
      desc: 'Fill in the short form to send your stay dates, guest count, room type, and notes. Our admin will help confirm availability before your arrival.',
      button: 'Reserve Now',
    },
    loading: 'Loading articles...',
    empty: 'No articles available for this language.',
  },
} as const
const blogPageCopy = computed(() => {
  return blogCopyByLocale[locale.value as keyof typeof blogCopyByLocale] || blogCopyByLocale.id
})

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

.blog-intro {
  max-width: 1040px;
  margin: 0 0 30px;
}

.blog-intro-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  margin-bottom: 14px;
  padding: 6px 12px;
  border: 1px solid rgba(232, 106, 51, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: var(--gold);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
}

.blog-intro h2 {
  max-width: 760px;
  margin: 0 0 14px;
  color: var(--forest);
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  line-height: 1.18;
}

.blog-intro-copy {
  display: grid;
  gap: 8px;
  max-width: 1040px;
}

.blog-intro p {
  max-width: 1040px;
  margin: 0;
  color: var(--text);
  font-size: 0.98rem;
  line-height: 1.78;
}

.blog-card {
  background: var(--white);
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
  background: rgba(27, 67, 50, 0.08);
  color: var(--forest);
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
  color: var(--forest);
  font-weight: 600;
  font-size: 0.9rem;
}

.blog-empty {
  padding: 42px 0;
  text-align: center;
  color: var(--text2);
}

.blog-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 34px;
  padding: 24px;
  border: 1px solid rgba(27, 67, 50, 0.14);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(250, 246, 240, 0.96));
  box-shadow: 0 16px 40px rgba(91, 64, 51, 0.08);
}

.blog-cta span {
  display: inline-flex;
  margin-bottom: 7px;
  color: var(--gold);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
}

.blog-cta h2 {
  margin: 0 0 8px;
  color: var(--forest);
  font-size: 1.45rem;
}

.blog-cta p {
  max-width: 720px;
  margin: 0;
  color: var(--text2);
  font-size: 0.94rem;
  line-height: 1.65;
}

.blog-cta-btn {
  flex: 0 0 auto;
  min-width: 170px;
  min-height: 48px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: var(--cta-orange);
  color: var(--white);
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(211, 84, 0, 0.22);
}

.blog-cta-btn:hover {
  background: var(--gold-lt);
}

@media (max-width: 720px) {
  .blog-intro {
    margin-bottom: 24px;
  }

  .blog-intro-kicker {
    min-height: 28px;
    margin-bottom: 12px;
    font-size: 0.72rem;
  }

  .blog-intro h2 {
    font-size: 1.55rem;
    line-height: 1.22;
  }

  .blog-intro p {
    font-size: 0.9rem;
    line-height: 1.68;
  }

  .blog-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .blog-cta {
    display: grid;
    gap: 18px;
    margin-top: 28px;
    padding: 20px;
    border-radius: 12px;
  }

  .blog-cta h2 {
    font-size: 1.18rem;
  }

  .blog-cta p {
    font-size: 0.88rem;
  }

  .blog-cta-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>
