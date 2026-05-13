<template>
  <div class="bottom-bar" role="complementary" :aria-label="$t('nav.reserve')">
    <button
      type="button"
      class="bb-wa"
      :aria-label="$t('nav.reserve') + ' - Wisma Apollo'"
      @click="openBookingForm"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 5v11h10V8H7Zm2-5v2h6V3h2v2h1v2H6V5h1V3h2Zm0 7h2v2H9v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2H9v-2Zm4 0h2v2h-2v-2Z" />
      </svg>
      <span>{{ $t('nav.reserve') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/useBookingStore'

const bookingStore = useBookingStore()

function openBookingForm() {
  bookingStore.openModal()
}
</script>
