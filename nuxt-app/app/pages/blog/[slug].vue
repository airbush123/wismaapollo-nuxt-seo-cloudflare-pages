<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/blog')" class="lp-back" style="color: rgba(255,255,255,0.7);">← {{ $t('nav.blog') }}</NuxtLink>
        <h1>{{ article?.title || 'Article' }}</h1>
      </div>
    </div>

    <div class="blog-article">
      <div class="container">
        <ContentRenderer v-if="article" :value="article" />
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
})
</script>
