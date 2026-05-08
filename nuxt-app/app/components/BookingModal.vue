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

        <h3 class="bm-title" id="bm-title">{{ $t('booking.title') }}</h3>
        <p class="bm-desc">{{ $t('booking.desc') }}</p>

        <form @submit.prevent="bookingStore.submitForm()" novalidate>
          <div class="bm-group">
            <label for="bm-name">{{ $t('booking.nameLabel') }}</label>
            <input
              type="text"
              id="bm-name"
              v-model="bookingStore.name"
              :placeholder="$t('booking.namePlaceholder')"
              :aria-invalid="!!bookingStore.errors.name"
              :aria-describedby="bookingStore.errors.name ? 'bm-name-error' : undefined"
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
              required
            />
            <p v-if="bookingStore.errors.phone" id="bm-phone-error" class="bm-error" role="alert">
              {{ bookingStore.errors.phone }}
            </p>
          </div>

          <div class="bm-grid">
            <div class="bm-group">
              <label for="bm-check-in">{{ $t('booking.checkInLabel') }}</label>
              <input
                type="date"
                id="bm-check-in"
                v-model="bookingStore.checkIn"
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
                :aria-invalid="!!bookingStore.errors.checkOut"
                :aria-describedby="bookingStore.errors.checkOut ? 'bm-check-out-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.checkOut" id="bm-check-out-error" class="bm-error" role="alert">
                {{ bookingStore.errors.checkOut }}
              </p>
            </div>
          </div>

          <div class="bm-group">
            <label for="bm-room-type">{{ $t('booking.roomTypeLabel') }}</label>
            <select
              id="bm-room-type"
              v-model="bookingStore.roomType"
              :aria-invalid="!!bookingStore.errors.roomType"
              :aria-describedby="bookingStore.errors.roomType ? 'bm-room-type-error' : undefined"
            >
              <option value="single">{{ $t('booking.roomTypes.single') }}</option>
              <option value="double">{{ $t('booking.roomTypes.double') }}</option>
            </select>
            <p v-if="bookingStore.errors.roomType" id="bm-room-type-error" class="bm-error" role="alert">
              {{ bookingStore.errors.roomType }}
            </p>
          </div>

          <div class="bm-grid">
            <div class="bm-group">
              <label for="bm-room-count">{{ $t('booking.roomCountLabel') }}</label>
              <input
                type="number"
                id="bm-room-count"
                v-model.number="bookingStore.roomCount"
                min="1"
                max="20"
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
                :aria-invalid="!!bookingStore.errors.guestCount"
                :aria-describedby="bookingStore.errors.guestCount ? 'bm-guest-count-error' : undefined"
                required
              />
              <p v-if="bookingStore.errors.guestCount" id="bm-guest-count-error" class="bm-error" role="alert">
                {{ bookingStore.errors.guestCount }}
              </p>
            </div>
          </div>

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

          <button type="submit" class="bm-btn" :disabled="bookingStore.isSubmitting">
            <svg v-if="!bookingStore.isSubmitting" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span v-if="bookingStore.isSubmitting" class="bm-loading"></span>
            <span>{{ bookingStore.isSubmitting ? $t('booking.submitting') : $t('booking.submit') }}</span>
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/useBookingStore'

const bookingStore = useBookingStore()
const modalRef = ref<HTMLElement | null>(null)

// Focus trap & initial focus
watch(() => bookingStore.isModalOpen, (open) => {
  if (open) {
    nextTick(() => {
      const firstInput = document.getElementById('bm-name')
      firstInput?.focus()
    })
  }
})
</script>
