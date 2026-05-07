<template>
  <div>
    <SkipLink />
    <AppNavbar />
    <main id="main-content" role="main">
      <slot />
    </main>
    <AppFooter />
    <BottomBar />
    <BookingModal />
    <LightboxOverlay />
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useBookingStore } from '~/stores/useBookingStore'

const uiStore = useUIStore()
const bookingStore = useBookingStore()

// Initialize tracking on client
onMounted(() => {
  bookingStore.initTracking()

  // Scroll listener for navbar
  window.addEventListener('scroll', () => {
    uiStore.setScrolled(window.scrollY > 40)
  }, { passive: true })
})
</script>
