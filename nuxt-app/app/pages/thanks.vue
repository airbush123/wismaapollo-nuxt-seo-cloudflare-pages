<template>
  <section class="thanks-page" aria-labelledby="thanks-title">
    <div class="thanks-panel">
      <p class="thanks-kicker">Reservasi Wisma Apollo</p>
      <h1 id="thanks-title">Reservasi Anda sedang diproses</h1>
      <p class="thanks-copy">
        Silakan lanjutkan chat WhatsApp dengan admin untuk cek ketersediaan kamar.
        Jika WhatsApp belum terbuka otomatis, gunakan tombol di bawah ini.
      </p>

      <div class="thanks-actions">
        <a
          class="thanks-wa"
          :href="waUrl"
          target="_blank"
          rel="noopener"
        >
          Lanjutkan ke WhatsApp
        </a>
        <NuxtLink class="thanks-home" to="/">Kembali ke Home</NuxtLink>
      </div>

      <div class="thanks-contact">
        <span>Nomor CS Wisma Apollo</span>
        <button type="button" @click="copyPhone">
          {{ copied ? 'Nomor tersalin' : '0818 232 021' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const WA_NUMBER = '62818232021'
const CS_PHONE = '0818232021'
const DEFAULT_MESSAGE = 'Halo admin Wisma Apollo, saya ingin cek ketersediaan kamar.'
const LAST_WA_URL_KEY = 'wisma_last_wa_url'
const LAST_WA_MESSAGE_KEY = 'wisma_last_wa_message'

const waUrl = ref(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`)
const copied = ref(false)

onMounted(() => {
  try {
    const storedUrl = sessionStorage.getItem(LAST_WA_URL_KEY)
    const storedMessage = sessionStorage.getItem(LAST_WA_MESSAGE_KEY)
    waUrl.value = storedUrl || `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(storedMessage || DEFAULT_MESSAGE)}`
  } catch {
    waUrl.value = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
  }

  useTracking().clearBookingSession()
})

async function copyPhone() {
  try {
    await navigator.clipboard.writeText(CS_PHONE)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}

useHead({
  title: 'Reservasi Diproses - Wisma Apollo',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
