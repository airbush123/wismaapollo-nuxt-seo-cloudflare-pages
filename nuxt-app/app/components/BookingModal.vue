<template>
  <Teleport to="body">
    <div
      v-if="bookingStore.isModalOpen"
      class="booking-modal-overlay"
      :class="{ show: bookingStore.isModalOpen }"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'bm-title'"
      @click.self="bookingStore.closeModal()"
      @keydown.escape="bookingStore.closeModal()"
    >
      <div class="booking-modal" ref="modalRef">
        <button
          class="bm-close"
          @click="bookingStore.closeModal()"
          :aria-label="'Close'"
        >&times;</button>

        <div class="bm-head">
          <div>
            <p class="bm-kicker">{{ $t('booking.kicker') }}</p>
            <h3 class="bm-title" id="bm-title">{{ $t('booking.title') }}</h3>
            <p class="bm-desc">{{ $t('booking.desc') }}</p>
          </div>
          <div class="bm-summary" aria-live="polite">
            <span>{{ selectedRoomName }}</span>
            <strong>{{ selectedRoomPrice }}</strong>
            <small>{{ staySummary }}</small>
          </div>
        </div>

        <form @submit.prevent="bookingStore.submitForm()" novalidate>
          <div class="bm-form-grid">
            <div class="bm-group">
              <label for="bm-name">{{ $t('booking.nameLabel') }}</label>
              <input
                type="text"
                id="bm-name"
                v-model="bookingStore.name"
                :placeholder="$t('booking.namePlaceholder')"
                :aria-invalid="!!bookingStore.errors.name"
                :aria-describedby="bookingStore.errors.name ? 'bm-name-error' : undefined"
                autocomplete="name"
                required
              />
              <p v-if="bookingStore.errors.name" id="bm-name-error" class="bm-error" role="alert">
                {{ bookingStore.errors.name }}
              </p>
            </div>

            <div class="bm-group">
              <label for="bm-phone">{{ $t('booking.phoneLabel') }}</label>
              <input
                type="tel"
                id="bm-phone"
                v-model="bookingStore.phone"
                :placeholder="$t('booking.phonePlaceholder')"
                :aria-invalid="!!bookingStore.errors.phone"
                :aria-describedby="bookingStore.errors.phone ? 'bm-phone-error' : undefined"
                autocomplete="tel"
                inputmode="tel"
                required
              />
              <p v-if="bookingStore.errors.phone" id="bm-phone-error" class="bm-error" role="alert">
                {{ bookingStore.errors.phone }}
              </p>
            </div>
          </div>

          <div class="bm-form-grid">
            <div class="bm-group">
              <label for="bm-check-in">{{ $t('booking.checkInLabel') }}</label>
              <input
                type="date"
                id="bm-check-in"
                v-model="bookingStore.checkIn"
                :min="minCheckInDate"
                :aria-invalid="!!bookingStore.errors.checkIn"
                :aria-describedby="bookingStore.errors.checkIn ? 'bm-check-in-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.checkIn" id="bm-check-in-error" class="bm-error" role="alert">
                {{ bookingStore.errors.checkIn }}
              </p>
            </div>

            <div class="bm-group">
              <label for="bm-check-out">{{ $t('booking.checkOutLabel') }}</label>
              <input
                type="date"
                id="bm-check-out"
                v-model="bookingStore.checkOut"
                :min="minCheckOutDate"
                :aria-invalid="!!bookingStore.errors.checkOut"
                :aria-describedby="bookingStore.errors.checkOut ? 'bm-check-out-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.checkOut" id="bm-check-out-error" class="bm-error" role="alert">
                {{ bookingStore.errors.checkOut }}
              </p>
            </div>
          </div>
          <p class="bm-time-note">{{ $t('booking.timeNote') }}</p>

          <div class="bm-group">
            <span class="bm-label">{{ $t('booking.roomTypeLabel') }}</span>
            <div class="bm-room-options" role="radiogroup" :aria-label="$t('booking.roomTypeLabel')">
              <button
                type="button"
                class="bm-room-option"
                :class="{ active: bookingStore.roomType === 'single' }"
                :aria-pressed="bookingStore.roomType === 'single'"
                @click="bookingStore.setRoomType('single')"
              >
                <span>{{ $t('booking.roomTypeNames.single') }}</span>
                <strong>Rp200.000</strong>
                <small>{{ $t('booking.perNight') }}</small>
              </button>
              <button
                type="button"
                class="bm-room-option"
                :class="{ active: bookingStore.roomType === 'double' }"
                :aria-pressed="bookingStore.roomType === 'double'"
                @click="bookingStore.setRoomType('double')"
              >
                <span>{{ $t('booking.roomTypeNames.double') }}</span>
                <strong>Rp250.000</strong>
                <small>{{ $t('booking.perNight') }}</small>
              </button>
            </div>
            <p v-if="bookingStore.errors.roomType" id="bm-room-type-error" class="bm-error" role="alert">
              {{ bookingStore.errors.roomType }}
            </p>
            <p class="bm-room-note">{{ $t('booking.nonSmokingNote') }}</p>
          </div>

          <div class="bm-form-grid compact">
            <div class="bm-group">
              <label for="bm-room-count">{{ $t('booking.roomCountLabel') }}</label>
              <input
                type="number"
                id="bm-room-count"
                v-model.number="bookingStore.roomCount"
                min="1"
                :max="maxRoomCount"
                inputmode="numeric"
                :aria-invalid="!!bookingStore.errors.roomCount"
                :aria-describedby="bookingStore.errors.roomCount ? 'bm-room-count-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.roomCount" id="bm-room-count-error" class="bm-error" role="alert">
                {{ bookingStore.errors.roomCount }}
              </p>
            </div>

            <div class="bm-group">
              <label for="bm-guest-count">{{ $t('booking.guestCountLabel') }}</label>
              <input
                type="number"
                id="bm-guest-count"
                v-model.number="bookingStore.guestCount"
                min="1"
                max="50"
                inputmode="numeric"
                :aria-invalid="!!bookingStore.errors.guestCount"
                :aria-describedby="bookingStore.errors.guestCount ? 'bm-guest-count-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.guestCount" id="bm-guest-count-error" class="bm-error" role="alert">
                {{ bookingStore.errors.guestCount }}
              </p>
            </div>
          </div>

          <label class="bm-checkline" for="bm-breakfast">
            <input
              id="bm-breakfast"
              v-model="bookingStore.breakfast"
              type="checkbox"
            />
            <span>
              <strong>{{ $t('booking.breakfastLabel') }}</strong>
              <small>{{ $t('booking.breakfastHelp') }}</small>
            </span>
          </label>

          <div class="bm-group">
            <label for="bm-notes">{{ $t('booking.notesLabel') }}</label>
            <textarea
              id="bm-notes"
              v-model="bookingStore.notes"
              rows="3"
              :placeholder="$t('booking.notesPlaceholder')"
              :aria-invalid="!!bookingStore.errors.notes"
              :aria-describedby="bookingStore.errors.notes ? 'bm-notes-error' : undefined"
            ></textarea>
            <p v-if="bookingStore.errors.notes" id="bm-notes-error" class="bm-error" role="alert">
              {{ bookingStore.errors.notes }}
            </p>
          </div>

          <div class="bm-action-row">
            <div class="bm-total">
              <span>{{ $t('booking.estimate') }}</span>
              <strong>{{ totalEstimate }}</strong>
            </div>
            <button type="submit" class="bm-btn" :disabled="bookingStore.isSubmitting">
              <svg v-if="!bookingStore.isSubmitting" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span v-if="bookingStore.isSubmitting" class="bm-loading"></span>
              <span>{{ bookingStore.isSubmitting ? $t('booking.submitting') : $t('booking.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/useBookingStore'

const bookingStore = useBookingStore()
const modalRef = ref<HTMLElement | null>(null)
let phoneHashTimer: ReturnType<typeof setTimeout> | null = null
const { t, locale } = useI18n()

const roomPrices = {
  single: 200000,
  double: 250000,
}
const breakfastPrice = 25000
const roomLimits = {
  single: 3,
  double: 1,
}

const formatCurrency = (value: number) => new Intl.NumberFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(value)

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}
const parseDateInput = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}
const minCheckInDate = computed(() => toDateInputValue(new Date()))
const minCheckOutDate = computed(() => {
  const baseDate = bookingStore.checkIn ? parseDateInput(bookingStore.checkIn) : new Date()
  return toDateInputValue(addDays(baseDate, 1))
})
const maxRoomCount = computed(() => roomLimits[bookingStore.roomType])

const selectedRoomName = computed(() => t(`booking.roomTypeNames.${bookingStore.roomType}`))
const selectedRoomPrice = computed(() => formatCurrency(roomPrices[bookingStore.roomType]))
const stayNights = computed(() => {
  if (!bookingStore.checkIn || !bookingStore.checkOut) return 1

  const start = new Date(bookingStore.checkIn)
  const end = new Date(bookingStore.checkOut)
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  return Math.max(diff, 1)
})
const staySummary = computed(() => t('booking.summary', {
  nights: stayNights.value,
  rooms: bookingStore.roomCount || 1,
  guests: bookingStore.guestCount || 1,
}))
const totalEstimate = computed(() => {
  const roomTotal = roomPrices[bookingStore.roomType] * stayNights.value * (bookingStore.roomCount || 1)
  const breakfastTotal = bookingStore.breakfast
    ? breakfastPrice * stayNights.value * (bookingStore.guestCount || 1)
    : 0
  const total = roomTotal + breakfastTotal
  return formatCurrency(total)
})

// Focus trap & initial focus
watch(() => bookingStore.isModalOpen, (open) => {
  if (open) {
    nextTick(() => {
      const firstInput = document.getElementById('bm-name')
      firstInput?.focus()
    })
  }
})

watch(() => bookingStore.checkIn, () => {
  if (!bookingStore.checkIn) return

  const nextCheckOut = toDateInputValue(addDays(parseDateInput(bookingStore.checkIn), 1))
  if (!bookingStore.checkOut || bookingStore.checkOut < nextCheckOut) {
    bookingStore.checkOut = nextCheckOut
  }
})

watch(() => bookingStore.roomType, () => {
  bookingStore.normalizeRoomCount()
})

watch(() => bookingStore.roomCount, () => {
  if (!bookingStore.roomCount || bookingStore.roomCount < 1) {
    bookingStore.roomCount = 1
    return
  }

  if (bookingStore.roomCount > maxRoomCount.value) {
    bookingStore.roomCount = maxRoomCount.value
  }
})

watch(() => bookingStore.phone, (phone) => {
  if (!import.meta.client) return

  if (phoneHashTimer) {
    clearTimeout(phoneHashTimer)
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length < 10) return

  phoneHashTimer = setTimeout(() => {
    useTracking().trackUserData(phone)
  }, 1200)
})
</script>
