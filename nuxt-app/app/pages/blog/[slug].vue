<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/blog')" class="lp-back lp-back-light">← {{ $t('nav.blog') }}</NuxtLink>
        <h1>{{ article?.title || 'Article' }}</h1>
      </div>
    </div>

    <div class="blog-article">
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
const route = useRoute()
const slug = route.params.slug as string

const { locale } = useI18n()
const localePath = useLocalePath()
const { data: article } = await useAsyncData(`article-view-${locale.value}-${slug}`, async () => {
  return await queryCollection('content').path(`/${locale.value}/blog/${slug}`).first()
}, { watch: [locale], default: () => null })

useSeoMeta({
  title: article.value?.title || 'Blog – Wisma Apollo',
  description: article.value?.description || '',
  ogTitle: article.value?.title || 'Blog - Wisma Apollo',
  ogDescription: article.value?.description || '',
  ogUrl: () => `https://wisma-apollo.my.id/blog/${slug}`,
})

useHead({
  link: [
    { rel: 'canonical', href: `https://wisma-apollo.my.id/blog/${slug}` },
  ],
})
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
