<template>
  <header class="hero" id="hero" role="banner">
    <div class="hero-bg" aria-hidden="true">
      <picture>
        <source
          media="(min-width: 768px)"
          srcset="/images/penginapan-di-kuala-kurun-desktop.webp"
        >
        <NuxtImg
          src="/images/hero.webp"
          alt="Hotel Kuala Kurun - Penginapan Wisma Apollo"
          width="480"
          height="600"
          loading="eager"
          fetchpriority="high"
        />
      </picture>
    </div>
    <div class="hero-body anim-up">
      <p class="hero-tag">{{ $t('hero.tag') }}</p>
      <h1>{{ $t('hero.title') }}</h1>
      <p class="hero-motto">{{ $t('hero.motto') }}</p>
      <div class="hero-address" aria-label="Address">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ $t('hero.address') }}
      </div>
      <div class="hero-phone" aria-label="Phone">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
        {{ $t('hero.phone') }}
      </div>
      <NuxtLink :to="localePath('/#kamar')" class="btn-hero" :aria-label="$t('hero.cta')">
        {{ $t('hero.cta') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
useScrollAnimation()
</script>
