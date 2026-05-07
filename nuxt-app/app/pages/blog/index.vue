<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink to="/" class="lp-back" style="color: rgba(255,255,255,0.7);">← {{ $t('common.backHome') }}</NuxtLink>
        <h1>{{ $t('blog.title') }}</h1>
        <p>{{ $t('blog.desc') }}</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
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
              <span class="blog-card-tag">{{ (post as any).category }}</span>
              <h3>{{ (post as any).title }}</h3>
              <p>{{ (post as any).description || (post as any).excerpt }}</p>
              <span class="read-more">{{ $t('common.readMore') }}</span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else style="padding: 60px 0; text-align: center; color: var(--text2);">
          <p>{{ locale === 'id' ? 'Belum ada artikel untuk bahasa ini.' : 'No articles available for this language.' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: articles, pending, refresh } = await useAsyncData(`articles-${locale.value}`, async () => {
  const all = await queryCollection('content').all()
  return all.filter(a => a.path.startsWith(`/${locale.value}/blog/`))
})

watch(locale, () => {
  refresh()
})

useSeoMeta({
  title: locale.value === 'id' 
    ? 'Blog – Wisma Apollo Kuala Kurun | Tips Menginap & Wisata' 
    : 'Blog – Wisma Apollo Kuala Kurun | Travel Tips & Tourism',
  description: locale.value === 'id'
    ? 'Tips menginap, wisata, dan kuliner di Kuala Kurun & Gunung Mas, Kalimantan Tengah.'
    : 'Accommodation tips, tourism, and culinary guides for Kuala Kurun & Gunung Mas, Central Kalimantan.',
})
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
