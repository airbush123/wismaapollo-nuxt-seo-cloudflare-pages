<template>
  <div>
    <div class="lp-header">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="lp-back" style="color: rgba(255,255,255,0.7);">← {{ $t('common.backHome') }}</NuxtLink>
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

        <div style="margin-top: 32px;">
          <RoomCards />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { tm, locale } = useI18n()
const localePath = useLocalePath()

// Fetch localized page data from i18n using tm (Translation Message) for objects
const pageData = computed(() => {
  const data = tm(`pages.${slug}`) as any
  
  // Verify that it's a valid object from i18n
  if (data && typeof data === 'object' && typeof data.title === 'string') {
    return {
      title: String(data.title),
      subtitle: String(data.subtitle || ''),
      meta: String(data.meta || ''),
      sections: Array.isArray(data.sections) ? data.sections : []
    }
  }

  // Fallback if slug not found in i18n
  return {
    title: 'Wisma Apollo',
    subtitle: locale.value === 'id' ? 'Penginapan terbaik di Kuala Kurun' : 'The best accommodation in Kuala Kurun',
    meta: '',
    sections: [],
  }
})

useSeoMeta({
  title: () => pageData.value.title,
  description: () => pageData.value.meta,
  ogTitle: () => pageData.value.title,
  ogDescription: () => pageData.value.meta,
})

useScrollAnimation()
</script>
