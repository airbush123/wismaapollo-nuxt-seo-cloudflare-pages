<template>
  <div>
    <SkipLink />
    <AppNavbar />
    <main id="main-content" role="main">
      <slot />
    </main>
    <AppFooter />
    <BottomBar />
    <LazyBookingModal v-if="bookingStore.isModalOpen" />
    <LazyLightboxOverlay v-if="uiStore.isLightboxOpen" />
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useBookingStore } from '~/stores/useBookingStore'

const uiStore = useUIStore()
const bookingStore = useBookingStore()
let removeScrollListener: (() => void) | undefined

onMounted(() => {
  bookingStore.initTracking()

  let isTicking = false
  let lastScrolled = false
  uiStore.setScrolled(false)

  const updateScrolled = () => {
    isTicking = false
    const nextScrolled = window.scrollY > 40
    if (nextScrolled !== lastScrolled) {
      lastScrolled = nextScrolled
      uiStore.setScrolled(nextScrolled)
    }
  }

  const onScroll = () => {
    if (!isTicking) {
      isTicking = true
      window.requestAnimationFrame(updateScrolled)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  removeScrollListener = () => window.removeEventListener('scroll', onScroll)
})

onUnmounted(() => {
  removeScrollListener?.()
})
</script>
