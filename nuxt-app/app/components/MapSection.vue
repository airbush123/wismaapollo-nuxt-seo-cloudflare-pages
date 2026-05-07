<template>
  <section id="lokasi" class="section section-alt" role="region" aria-labelledby="map-title">
    <div class="container anim-up">
      <span class="label">{{ $t('map.label') }}</span>
      <h2 id="map-title">{{ $t('map.title') }}</h2>
      <p class="desc">{{ $t('map.address') }}</p>
      <div class="map-wrap">
        <iframe
          v-if="showMap"
          src="https://www.google.com/maps?q=Wisma+Apollo+Kuala+Kurun&output=embed"
          width="100%"
          height="280"
          style="border:0;border-radius:12px"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :title="$t('map.title')"
          :aria-label="$t('map.title') + ' - Google Maps'"
        ></iframe>
        <div v-else style="height:280px;display:flex;align-items:center;justify-content:center;background:var(--sand);color:var(--text2);font-size:0.85rem;">
          Loading map...
        </div>
      </div>
      <a
        href="https://www.google.com/maps/search/Wisma+Apollo+Kuala+Kurun"
        target="_blank"
        rel="noopener"
        class="map-link"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        {{ $t('map.openMaps') }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
const showMap = ref(false)

onMounted(() => {
  // Lazy load map when section is near viewport
  if ('IntersectionObserver' in window) {
    const section = document.getElementById('lokasi')
    if (section) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            showMap.value = true
            obs.disconnect()
          }
        },
        { rootMargin: '200px' }
      )
      obs.observe(section)
    }
  } else {
    showMap.value = true
  }
})
</script>
