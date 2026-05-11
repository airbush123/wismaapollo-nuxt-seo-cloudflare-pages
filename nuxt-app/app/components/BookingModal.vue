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
            <div class="bm-room-options" :aria-label="$t('booking.roomTypeLabel')">
              <label
                class="bm-room-option"
                :class="{ active: activeRoomCard === 'single' }"
                for="bm-single-room-count"
                @click="activeRoomCard = 'single'"
              >
                <div class="bm-room-option-top">
                  <span class="bm-room-option-name">{{ $t('booking.roomTypeNames.single') }}</span>
                  <div class="bm-room-option-price">
                    <strong>Rp200.000</strong>
                    <small>{{ $t('booking.perNight') }}</small>
                  </div>
                </div>
                <div class="bm-room-option-field">
                  <small class="bm-room-option-label">{{ $t('booking.roomCountLabel') }}</small>
                  <input
                    id="bm-single-room-count"
                    v-model.number="bookingStore.singleRoomCount"
                    type="number"
                    min="0"
                    max="3"
                    inputmode="numeric"
                    :aria-invalid="!!bookingStore.errors.singleRoomCount"
                    @focus="activeRoomCard = 'single'"
                    @change="bookingStore.normalizeRoomCounts()"
                  />
                </div>
              </label>
              <label
                class="bm-room-option"
                :class="{ active: activeRoomCard === 'double' }"
                for="bm-double-room-count"
                @click="activeRoomCard = 'double'"
              >
                <div class="bm-room-option-top">
                  <span class="bm-room-option-name">{{ $t('booking.roomTypeNames.double') }}</span>
                  <div class="bm-room-option-price">
                    <strong>Rp250.000</strong>
                    <small>{{ $t('booking.perNight') }}</small>
                  </div>
                </div>
                <div class="bm-room-option-field">
                  <small class="bm-room-option-label">{{ $t('booking.roomCountLabel') }}</small>
                  <input
                    id="bm-double-room-count"
                    v-model.number="bookingStore.doubleRoomCount"
                    type="number"
                    min="0"
                    max="1"
                    inputmode="numeric"
                    :aria-invalid="!!bookingStore.errors.doubleRoomCount"
                    @focus="activeRoomCard = 'double'"
                    @change="bookingStore.normalizeRoomCounts()"
                  />
                </div>
              </label>
            </div>
            <p v-if="bookingStore.errors.singleRoomCount" class="bm-error" role="alert">
              {{ bookingStore.errors.singleRoomCount }}
            </p>
            <p v-if="bookingStore.errors.doubleRoomCount" class="bm-error" role="alert">
              {{ bookingStore.errors.doubleRoomCount }}
            </p>
            <p class="bm-room-note">{{ $t('booking.nonSmokingNote') }}</p>
          </div>

          <div class="bm-form-grid compact">
            <div class="bm-group">
              <label for="bm-guest-count">{{ $t('booking.guestCountLabel') }}</label>
              <div class="bm-guest-control-row">
                <input
                  type="number"
                  id="bm-guest-count"
                  v-model.number="bookingStore.guestCount"
                  min="1"
                  :max="maxGuestCount"
                  inputmode="numeric"
                  :aria-invalid="!!bookingStore.errors.guestCount"
                  :aria-describedby="bookingStore.errors.guestCount ? 'bm-guest-count-error' : 'bm-guest-note'"
                  required
                />
                <p id="bm-guest-note" class="bm-field-note">{{ guestCapacityHelp }}</p>
              </div>
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
const activeRoomCard = ref<'single' | 'double'>('single')

const roomPrices = {
  single: 200000,
  double: 250000,
}
const breakfastPrice = 25000
const adultCapacities = {
  single: 2,
  double: 3,
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
const maxGuestCount = computed(() => {
  const singleCapacity = bookingStore.singleRoomCount * adultCapacities.single
  const doubleCapacity = bookingStore.doubleRoomCount * adultCapacities.double
  return Math.max(singleCapacity + doubleCapacity, adultCapacities.single)
})

const selectedRoomName = computed(() => bookingStore.roomSummary || t('booking.roomTypeLabel'))
const guestCapacityHelp = computed(() => {
  const rooms = Math.max(bookingStore.totalRoomCount || 1, 1)
  const hasSingle = bookingStore.singleRoomCount > 0
  const hasDouble = bookingStore.doubleRoomCount > 0
  const helpKey = hasSingle && hasDouble
    ? 'mixed'
    : hasSingle && bookingStore.singleRoomCount > 1
      ? 'singleMulti'
      : hasDouble
        ? 'double'
        : 'single'
  return t(`booking.guestCountHelp.${helpKey}`, {
    adults: maxGuestCount.value,
    perRoom: hasDouble && !hasSingle ? adultCapacities.double : adultCapacities.single,
    rooms,
    singleRooms: bookingStore.singleRoomCount,
    doubleRooms: bookingStore.doubleRoomCount,
  })
})
const stayNights = computed(() => {
  if (!bookingStore.checkIn || !bookingStore.checkOut) return 1

  const start = new Date(bookingStore.checkIn)
  const end = new Date(bookingStore.checkOut)
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  return Math.max(diff, 1)
})
const staySummary = computed(() => t('booking.summary', {
  nights: stayNights.value,
  rooms: bookingStore.totalRoomCount || 1,
  guests: bookingStore.guestCount || 1,
}))
const totalEstimate = computed(() => {
  const roomTotal = ((bookingStore.singleRoomCount * roomPrices.single) + (bookingStore.doubleRoomCount * roomPrices.double)) * stayNights.value
  const breakfastTotal = bookingStore.breakfast
    ? breakfastPrice * stayNights.value * (bookingStore.guestCount || 1)
    : 0
  const total = roomTotal + breakfastTotal
  return formatCurrency(total)
})
const selectedRoomPrice = computed(() => totalEstimate.value)

// Focus trap & initial focus
watch(() => bookingStore.isModalOpen, (open) => {
  if (open) {
    activeRoomCard.value = bookingStore.roomTypeValue === 'double' ? 'double' : 'single'
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

watch(() => [bookingStore.singleRoomCount, bookingStore.doubleRoomCount], () => {
  bookingStore.normalizeRoomCounts()
  if (bookingStore.guestCount > maxGuestCount.value) {
    bookingStore.guestCount = maxGuestCount.value
  }
})

watch(() => bookingStore.guestCount, () => {
  if (!bookingStore.guestCount || bookingStore.guestCount < 1) {
    bookingStore.guestCount = 1
    return
  }

  if (bookingStore.guestCount > maxGuestCount.value) {
    bookingStore.guestCount = maxGuestCount.value
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
