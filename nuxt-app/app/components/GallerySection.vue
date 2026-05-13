<template>
  <section id="galeri" class="section section-alt" role="region" aria-labelledby="gallery-title">
    <div class="container anim-up">
      <span class="label">{{ $t('gallery.label') }}</span>
      <h2 id="gallery-title">{{ $t('gallery.title') }}</h2>
      <div class="gallery" role="list">
        <NuxtImg
          v-for="(img, i) in images"
          :key="i"
          :src="img.src"
          :alt="img.alt"
          width="400"
          height="300"
          loading="lazy"
          role="listitem"
          @click="uiStore.openLightbox(img.src, img.alt)"
          @keydown.enter="uiStore.openLightbox(img.src, img.alt)"
          tabindex="0"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'

const uiStore = useUIStore()

const images = [
  { src: '/images/gallery/wisma-apollo-hotel-kuala-kurun.webp', alt: 'Hotel Kuala Kurun - Tampak Depan Wisma Apollo' },
  { src: '/images/gallery/kamar-hotel-murah-kuala-kurun.webp', alt: 'Hotel Murah Kuala Kurun - Fasilitas TV & Meja Kerja' },
  { src: '/images/gallery/kamar-penginapan-kuala-kurun.webp', alt: 'Penginapan Kuala Kurun - Kamar Single Bed Nyaman' },
  { src: '/images/gallery/kamar-penginapan-murah-kuala-kurun.webp', alt: 'Penginapan Murah Kuala Kurun - Kamar Mandi Dalam' },
  { src: '/images/gallery/hotel-kuala-kurun-gunung-mas.webp', alt: 'Hotel Kuala Kurun Gunung Mas - Kamar Double Bed' },
  { src: '/images/gallery/kamar-double-bed-wisma-apollo.webp', alt: 'Hotel Murah di Kuala Kurun - Kamar Double Bed Wisma Apollo' },
]
</script>
