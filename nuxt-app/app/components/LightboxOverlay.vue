<template>
  <Teleport to="body">
    <div
      v-if="uiStore.isLightboxOpen"
      class="lightbox-overlay"
      :class="{ show: uiStore.isLightboxOpen }"
      role="dialog"
      aria-modal="true"
      :aria-label="uiStore.lightboxAlt || 'Image preview'"
      @click.self="uiStore.closeLightbox()"
      @keydown.escape="uiStore.closeLightbox()"
      tabindex="-1"
      ref="overlayRef"
    >
      <button class="lightbox-close" @click="uiStore.closeLightbox()" aria-label="Close image">&times;</button>
      <img :src="uiStore.lightboxImage" :alt="uiStore.lightboxAlt || 'Enlarged Image'" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'

const uiStore = useUIStore()
const overlayRef = ref<HTMLElement | null>(null)

watch(() => uiStore.isLightboxOpen, (open) => {
  if (open) {
    nextTick(() => overlayRef.value?.focus())
  }
})
</script>
