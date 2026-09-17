<template>
  <section id="lokasi" class="section section-alt" role="region" aria-labelledby="map-title">
    <div class="container anim-up">
      <span class="label">{{ $t('map.label') }}</span>
      <h2 id="map-title">{{ $t('map.title') }}</h2>
      <p class="desc">{{ $t('map.address') }}</p>

      <!-- Tampilan Ramah In-App Browser (Instagram/FB) untuk mencegah error X-Frame/Cookie Google -->
      <div v-if="isInAppBrowser" class="map-inapp-card">
        <div class="map-inapp-header">
          <div class="map-pin-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#1b4332">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <div class="map-hotel-name">Wisma Apollo Kuala Kurun</div>
            <div class="map-hotel-sub">Jl. Letjen Soeprapto No.56, Kuala Kurun</div>
          </div>
        </div>

        <div class="map-inapp-body">
          <p class="map-inapp-info">
            📍 Lokasi strategis di pusat kota Kuala Kurun. Akses jalan aspal utama, dekat pusat kuliner & perkantoran, serta area parkir luas aman.
          </p>
          <div class="map-btn-group">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Wisma+Apollo+Kuala+Kurun"
              target="_blank"
              rel="noopener"
              class="btn-open-gmaps"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Buka Petunjuk Arah di Google Maps
            </a>
            <button type="button" class="btn-copy-addr" @click="copyAddress">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {{ copied ? 'Alamat Tersalin! ✓' : 'Salin Alamat Lengkap' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tampilan Iframe Standar untuk Chrome, Safari, dan Desktop -->
      <div v-else class="map-wrap">
        <iframe
          v-if="showMap"
          src="https://maps.google.com/maps?q=-1.4683,113.886(Wisma+Apollo+Kuala+Kurun)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
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
        v-if="!isInAppBrowser"
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
const isInAppBrowser = ref(false)
const copied = ref(false)

const copyAddress = () => {
  const fullAddress = 'Wisma Apollo, Jl. Letjen Soeprapto No.56, Kuala Kurun, Kel. Tampang Tumbang Anjir, Kec. Kurun, Kab. Gunung Mas, Kalimantan Tengah 74571'
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(fullAddress).then(() => {
      copied.value = true
      setTimeout(() => { copied.value = false }, 2500)
    }).catch(() => {})
  }
}

onMounted(() => {
  // Deteksi jika dibuka dari in-app browser seperti Instagram / Facebook / TikTok / Line
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || ''
    isInAppBrowser.value = /Instagram|FBAN|FBAV|Line|TikTok|Snapchat/i.test(ua)
  }

  // Lazy load map saat section mendekati viewport (untuk browser non in-app)
  if ('IntersectionObserver' in window) {
    const section = document.getElementById('lokasi')
    if (section) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
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

<style scoped>
.map-inapp-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.map-inapp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.map-pin-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(27, 67, 50, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.map-hotel-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1b4332;
}

.map-hotel-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

.map-inapp-info {
  font-size: 0.86rem;
  line-height: 1.55;
  color: #334155;
  margin-bottom: 16px;
}

.map-btn-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-open-gmaps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1b4332;
  color: #ffffff !important;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 13px 18px;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.25);
  transition: opacity 0.2s ease;
}

.btn-open-gmaps:active {
  opacity: 0.9;
}

.btn-copy-addr {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-copy-addr:active {
  background: #f1f5f9;
}
</style>
