<template>
  <nav :class="['nav', { scrolled: uiStore.isScrolled }]" role="navigation" aria-label="Main Navigation">
    <div class="nav-inner">
      <NuxtLink :to="localePath('/')" class="nav-logo" :aria-label="'Wisma Apollo - ' + $t('common.backHome')">
        <NuxtImg src="/images/logo/wisma-apollo-logo.png" alt="Logo Wisma Apollo" width="44" height="44" loading="eager" />
        <span class="logo-text">
          Apollo
        </span>
      </NuxtLink>
      <div class="desktop-nav-shell">
        <div class="desktop-menu" role="menubar">
          <NuxtLink :to="localePath('/#tentang')" role="menuitem">{{ $t('nav.about') }}</NuxtLink>
          <NuxtLink :to="localePath('/#fasilitas')" role="menuitem">{{ $t('nav.facilities') }}</NuxtLink>
          <NuxtLink :to="localePath('/#kamar')" role="menuitem">{{ $t('nav.rooms') }}</NuxtLink>
          <NuxtLink :to="localePath('/#galeri')" role="menuitem">{{ $t('nav.gallery') }}</NuxtLink>
          <NuxtLink :to="localePath('/#testimoni')" role="menuitem">{{ $t('nav.testimonials') }}</NuxtLink>
          <NuxtLink :to="localePath('/faq')" role="menuitem">{{ $t('nav.faq') }}</NuxtLink>
        </div>
        <button
          type="button"
          class="desktop-cta"
          @click="bookingStore.openModal()"
        >
          {{ $t('nav.reserve') }}
        </button>
      </div>
      <div style="display: flex; align-items: center;">
        <div class="lang-switch" role="group" aria-label="Language switcher">
          <button
            v-for="loc in locales"
            :key="loc.code"
            :class="['lang-btn', { active: locale === loc.code }]"
            :aria-pressed="locale === loc.code"
            @click="setLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </button>
        </div>
        <button
          class="menu-btn"
          :aria-expanded="uiStore.isMenuOpen"
          aria-controls="mobile-menu"
          :aria-label="uiStore.isMenuOpen ? 'Close menu' : 'Open menu'"
          @click="uiStore.toggleMenu()"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div
      id="mobile-menu"
      class="mobile-menu"
      role="menu"
      :aria-hidden="!uiStore.isMenuOpen"
    >
      <NuxtLink :to="localePath('/#tentang')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.about') }}</NuxtLink>
      <NuxtLink :to="localePath('/#fasilitas')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.facilities') }}</NuxtLink>
      <NuxtLink :to="localePath('/#kamar')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.rooms') }}</NuxtLink>
      <NuxtLink :to="localePath('/#galeri')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.gallery') }}</NuxtLink>
      <NuxtLink :to="localePath('/#testimoni')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.testimonials') }}</NuxtLink>
      <NuxtLink :to="localePath('/blog')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.blog') }}</NuxtLink>
      <NuxtLink :to="localePath('/faq')" role="menuitem" @click="uiStore.closeMenu()">{{ $t('nav.faq') }}</NuxtLink>
      <a
        :href="`https://wa.me/62818232021?text=${encodeURIComponent($t('common.waDefault'))}`"
        target="_blank"
        rel="noopener"
        class="menu-cta"
        role="menuitem"
        @click="handleMobileWaClick"
      >{{ $t('nav.reserve') }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useBookingStore } from '~/stores/useBookingStore'

const uiStore = useUIStore()
const bookingStore = useBookingStore()
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

function handleMobileWaClick() {
  useTracking().trackContact('mobile_nav_whatsapp')
  uiStore.closeMenu()
}

// Close menu on Escape
onMounted(() => {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && uiStore.isMenuOpen) {
      uiStore.closeMenu()
    }
  })
})
</script>
