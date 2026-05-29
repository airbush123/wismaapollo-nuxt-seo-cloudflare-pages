<template>
  <section class="thanks-page" aria-labelledby="thanks-title">
    <div class="thanks-panel">
      <p class="thanks-kicker">{{ copy.kicker }}</p>
      <h1 id="thanks-title">{{ copy.title }}</h1>
      <p class="thanks-copy">
        {{ copy.message }}
      </p>

      <div class="thanks-actions">
        <a
          class="thanks-wa"
          :href="waUrl"
          target="_blank"
          rel="noopener"
        >
          {{ copy.whatsapp }}
        </a>
        <NuxtLink class="thanks-home" :to="homePath">{{ copy.home }}</NuxtLink>
      </div>

      <div class="thanks-contact">
        <span>{{ copy.contactLabel }}</span>
        <button type="button" @click="copyPhone">
          {{ copied ? copy.copied : '0818 232 021' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()

if (locale.value === 'zh') {
  await navigateTo('/zh/', { redirectCode: 301 })
}

const WA_NUMBER = '62818232021'
const CS_PHONE = '0818232021'
const LAST_WA_URL_KEY = 'wisma_last_wa_url'
const LAST_WA_MESSAGE_KEY = 'wisma_last_wa_message'

const copy = computed(() => locale.value === 'en'
  ? {
      kicker: 'Wisma Apollo Reservation',
      title: 'Your reservation is being processed',
      message: 'Please continue the WhatsApp chat with our admin to check room availability. If WhatsApp does not open automatically, use the button below.',
      whatsapp: 'Continue to WhatsApp',
      home: 'Back to Home',
      contactLabel: 'Wisma Apollo CS Number',
      copied: 'Number copied',
      defaultMessage: 'Hello Wisma Apollo admin, I would like to check room availability.',
      seoTitle: 'Reservation Processing - Wisma Apollo',
    }
  : {
      kicker: 'Reservasi Wisma Apollo',
      title: 'Reservasi Anda sedang diproses',
      message: 'Silakan lanjutkan chat WhatsApp dengan admin untuk cek ketersediaan kamar. Jika WhatsApp belum terbuka otomatis, gunakan tombol di bawah ini.',
      whatsapp: 'Lanjutkan ke WhatsApp',
      home: 'Kembali ke Home',
      contactLabel: 'Nomor CS Wisma Apollo',
      copied: 'Nomor tersalin',
      defaultMessage: 'Halo admin Wisma Apollo, saya ingin cek ketersediaan kamar.',
      seoTitle: 'Reservasi Diproses - Wisma Apollo',
    })

const homePath = computed(() => locale.value === 'en' ? '/en/' : '/')
const waUrl = ref(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(copy.value.defaultMessage)}`)
const copied = ref(false)

onMounted(() => {
  try {
    const storedUrl = sessionStorage.getItem(LAST_WA_URL_KEY)
    const storedMessage = sessionStorage.getItem(LAST_WA_MESSAGE_KEY)
    waUrl.value = storedUrl || `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(storedMessage || copy.value.defaultMessage)}`
  } catch {
    waUrl.value = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(copy.value.defaultMessage)}`
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
  title: () => copy.value.seoTitle,
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
