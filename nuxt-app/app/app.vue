<script setup lang="ts">
const { locale } = useI18n()

const htmlLang = computed(() => {
  if (locale.value === 'zh') return 'zh-CN'
  if (locale.value === 'en') return 'en'
  return 'id'
})

useHead(() => ({
  htmlAttrs: {
    lang: htmlLang.value,
  },
}))
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
