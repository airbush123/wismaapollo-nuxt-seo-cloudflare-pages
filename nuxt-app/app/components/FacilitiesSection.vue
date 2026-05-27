<template>
  <section id="fasilitas" class="section section-alt" role="region" aria-labelledby="facilities-title">
    <div class="container anim-up">
      <span class="label">{{ $t('facilities.label') }}</span>
      <h2 id="facilities-title">{{ $t('facilities.title') }}</h2>
      <div class="facilities-media-mobile">
        <NuxtImg
          src="/images/facilities-smoking-corridor-mobile.webp"
          alt="Koridor santai outdoor Wisma Apollo dengan meja dan kursi"
          width="370"
          height="493"
          sizes="370px"
          densities="1x"
          quality="72"
          loading="lazy"
        />
        <div class="facilities-media-caption">
          <strong>{{ $t('facilities.smokingArea.title') }}</strong>
          <span>{{ $t('facilities.smokingArea.desc') }}</span>
        </div>
      </div>

      <div class="facilities-layout">
        <div class="facilities-media">
          <NuxtImg
            src="/images/facilities-smoking-corridor.webp"
            alt="Area koridor dan fasilitas smoking area Wisma Apollo"
            width="520"
            height="680"
            loading="lazy"
          />
          <div class="facilities-media-caption">
            <strong>{{ $t('facilities.smokingArea.title') }}</strong>
            <span>{{ $t('facilities.smokingArea.desc') }}</span>
          </div>
        </div>

        <div class="facilities-cards">
          <div class="fac-group">
            <h3 class="fac-title">{{ $t('facilities.room.title') }}</h3>
            <div class="fac-grid" role="list">
              <div v-for="(icon, i) in roomIcons" :key="'room-'+i" class="fac-item" role="listitem">
                <span aria-hidden="true">{{ icon }}</span>{{ $t(`facilities.room.items[${i}]`) }}
              </div>
            </div>
          </div>

          <div class="fac-group">
            <h3 class="fac-title">{{ $t('facilities.other.title') }}</h3>
            <div class="fac-grid" role="list">
              <div v-for="(icon, i) in otherIcons" :key="'other-'+i" class="fac-item" role="listitem">
                <span aria-hidden="true">{{ icon }}</span>{{ $t(`facilities.other.items[${i}]`) }}
              </div>
            </div>
          </div>

          <div class="fac-group fac-group-extra">
            <h3 class="fac-title">{{ $t('facilities.extra.title') }}</h3>
            <div class="fac-grid" role="list">
              <div v-for="(icon, i) in extraIcons" :key="'extra-'+i" class="fac-item" role="listitem">
                <span aria-hidden="true">{{ icon }}</span>{{ $t(`facilities.extra.items[${i}]`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const roomIcons = ['❄️', '📺', '🛁', '🧼', '🚿', '🔇']
const otherIcons = ['📶', '☕', '💧', '🅿️', '🛡️', '😊']
const extraIcons = ['🍳', '🛌']
</script>
