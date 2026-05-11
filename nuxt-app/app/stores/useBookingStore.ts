import { defineStore } from 'pinia'
import { BookingFormSchema } from '~/schemas/booking'
import type { BookingFormData } from '~/schemas/booking'

const GOOGLE_APP_SCRIPT_URL = '/api/webhook'
const WA_NUMBER = '62818232021'
const BREAKFAST_PRICE = 25000
const SINGLE_ROOM_PRICE = 200000
const DOUBLE_ROOM_PRICE = 250000
const SINGLE_ROOM_LIMIT = 3
const DOUBLE_ROOM_LIMIT = 1
const LAST_WA_URL_KEY = 'wisma_last_wa_url'
const LAST_WA_MESSAGE_KEY = 'wisma_last_wa_message'
const LAST_BOOKING_PAYLOAD_KEY = 'wisma_last_booking_payload'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getStayNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  return Number.isFinite(diffDays) && diffDays > 0 ? diffDays : 1
}

function getBreakfastValue(checkIn: string, checkOut: string, guestCount: number, breakfast: boolean) {
  if (!breakfast) return 0
  return BREAKFAST_PRICE * getStayNights(checkIn, checkOut) * Math.max(guestCount, 1)
}

function getRoomSummary(singleRoomCount: number, doubleRoomCount: number) {
  const rooms: string[] = []
  if (singleRoomCount > 0) rooms.push(`Single Bed: ${singleRoomCount} kamar`)
  if (doubleRoomCount > 0) rooms.push(`Double Bed: ${doubleRoomCount} kamar`)
  return rooms.join(', ')
}

function getRoomTypeValue(singleRoomCount: number, doubleRoomCount: number) {
  if (singleRoomCount > 0 && doubleRoomCount > 0) return 'mixed'
  if (doubleRoomCount > 0) return 'double'
  return 'single'
}

function getTotalRoomCount(singleRoomCount: number, doubleRoomCount: number) {
  return singleRoomCount + doubleRoomCount
}

function getRoomValue(checkIn: string, checkOut: string, singleRoomCount: number, doubleRoomCount: number) {
  const nights = getStayNights(checkIn, checkOut)
  return ((singleRoomCount * SINGLE_ROOM_PRICE) + (doubleRoomCount * DOUBLE_ROOM_PRICE)) * nights
}

function getTotalBookingValue(
  checkIn: string,
  checkOut: string,
  singleRoomCount: number,
  doubleRoomCount: number,
  guestCount: number,
  breakfast: boolean,
) {
  return getRoomValue(checkIn, checkOut, singleRoomCount, doubleRoomCount)
    + getBreakfastValue(checkIn, checkOut, guestCount, breakfast)
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    isModalOpen: false,
    currentWaUrl: `https://wa.me/${WA_NUMBER}`,
    name: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomType: 'single' as 'single' | 'double',
    roomCount: 1,
    singleRoomCount: 1,
    doubleRoomCount: 0,
    guestCount: 1,
    breakfast: false,
    notes: '',
    isSubmitting: false,
    errors: {} as Record<string, string>,
    source: 'Organic' as string,
    clickId: '' as string,
  }),

  actions: {
    openModal(waUrl?: string, roomType?: 'single' | 'double') {
      if (waUrl) this.currentWaUrl = waUrl
      if (roomType) this.setPrimaryRoomType(roomType)
      this.normalizeRoomCounts()
      this.ensureDefaultDates()
      this.isModalOpen = true
      this.errors = {}
    },

    closeModal() {
      this.isModalOpen = false
      this.errors = {}
    },

    setPrimaryRoomType(roomType: 'single' | 'double') {
      this.roomType = roomType
      this.singleRoomCount = roomType === 'single' ? 1 : 0
      this.doubleRoomCount = roomType === 'double' ? 1 : 0
      this.normalizeRoomCounts()
    },

    setRoomCount(type: 'single' | 'double', count: number) {
      if (type === 'single') {
        this.singleRoomCount = count
      } else {
        this.doubleRoomCount = count
      }
      this.normalizeRoomCounts()
    },

    normalizeRoomCounts() {
      this.singleRoomCount = Math.min(Math.max(Number(this.singleRoomCount) || 0, 0), SINGLE_ROOM_LIMIT)
      this.doubleRoomCount = Math.min(Math.max(Number(this.doubleRoomCount) || 0, 0), DOUBLE_ROOM_LIMIT)

      if (this.singleRoomCount + this.doubleRoomCount < 1) {
        this.singleRoomCount = 1
      }

      this.roomType = this.doubleRoomCount > 0 && this.singleRoomCount === 0 ? 'double' : 'single'
      this.roomCount = getTotalRoomCount(this.singleRoomCount, this.doubleRoomCount)
    },

    ensureDefaultDates() {
      const today = new Date()
      if (!this.checkIn) {
        this.checkIn = toDateInputValue(today)
      }
      if (!this.checkOut) {
        this.checkOut = toDateInputValue(addDays(today, 1))
      }
    },

    initTracking() {
      if (!import.meta.client) return
      try {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('fbclid')) {
          this.source = 'Meta'
          this.clickId = urlParams.get('fbclid') || ''
          sessionStorage.setItem('wa_source', this.source)
          sessionStorage.setItem('wa_click_id', this.clickId)
        } else if (urlParams.has('gclid') || urlParams.get('utm_source') === 'google') {
          this.source = 'Google'
          this.clickId = urlParams.get('gclid') || ''
          sessionStorage.setItem('wa_source', this.source)
          sessionStorage.setItem('wa_click_id', this.clickId)
        } else if (urlParams.has('wbraid') || urlParams.has('gbraid')) {
          this.source = 'Google'
          this.clickId = urlParams.get('wbraid') || urlParams.get('gbraid') || ''
          sessionStorage.setItem('wa_source', this.source)
          sessionStorage.setItem('wa_click_id', this.clickId)
        } else {
          this.source = sessionStorage.getItem('wa_source') || 'Organic'
          this.clickId = sessionStorage.getItem('wa_click_id') || ''
        }

        useTracking().captureClickIds()
      } catch {
        // Ignore sessionStorage exceptions in Strict Incognito Mode
      }
    },

    validate(): boolean {
      const result = BookingFormSchema.safeParse({
        name: this.name,
        phone: this.phone,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        singleRoomCount: this.singleRoomCount,
        doubleRoomCount: this.doubleRoomCount,
        guestCount: this.guestCount,
        breakfast: this.breakfast,
        notes: this.notes,
      })

      if (!result.success) {
        this.errors = {}
        result.error.issues.forEach((err) => {
          const field = err.path[0] as string
          this.errors[field] = err.message
        })
        return false
      }

      this.errors = {}
      return true
    },

    isQualifiedForAddToCart() {
      const cleanPhone = this.phone.replace(/[^0-9]/g, '')
      return this.name.trim().length >= 2
        && cleanPhone.length >= 10
        && Boolean(this.checkIn)
        && Boolean(this.checkOut)
        && this.totalRoomCount >= 1
    },

    async trackQualifiedAddToCart() {
      if (!import.meta.client || !this.isQualifiedForAddToCart()) return

      const tracking = useTracking()
      const hashedPhone = await tracking.trackUserData(this.phone)
      tracking.trackAddToCart(this.roomTypeValue, {
        room_summary: this.roomSummary,
        room_count: this.totalRoomCount,
        single_room_count: this.singleRoomCount,
        double_room_count: this.doubleRoomCount,
        guest_count: this.guestCount,
        stay_nights: getStayNights(this.checkIn, this.checkOut),
        total_booking_value: this.totalBookingValue,
        breakfast: this.breakfast,
        breakfast_value: getBreakfastValue(this.checkIn, this.checkOut, this.guestCount, this.breakfast),
        check_in: this.checkIn,
        check_out: this.checkOut,
        hashed_phone: hashedPhone,
        sha256_phone_number: hashedPhone,
        phone_number: hashedPhone,
        user_data: hashedPhone
          ? {
              sha256_phone_number: [hashedPhone],
            }
          : undefined,
      })
    },

    async submitForm() {
      if (this.isSubmitting) return
      if (!this.validate()) return

      this.isSubmitting = true

      const tracking = useTracking()
      const hashedPhone = await tracking.trackUserData(this.phone)

      // Submit data via hidden iframe
      await this.submitViaIframe()

      await tracking.trackLead({
        lead_source: this.source,
        room_type: this.roomTypeValue,
        room_summary: this.roomSummary,
        room_count: this.totalRoomCount,
        single_room_count: this.singleRoomCount,
        double_room_count: this.doubleRoomCount,
        guest_count: this.guestCount,
        breakfast: this.breakfast,
        breakfast_value: getBreakfastValue(this.checkIn, this.checkOut, this.guestCount, this.breakfast),
        stay_nights: getStayNights(this.checkIn, this.checkOut),
        total_booking_value: this.totalBookingValue,
        check_in: this.checkIn,
        check_out: this.checkOut,
        hashed_phone: hashedPhone,
        sha256_phone_number: hashedPhone,
        phone_number: hashedPhone,
        user_data: hashedPhone
          ? {
              sha256_phone_number: [hashedPhone],
            }
          : undefined,
      })

      // Redirect to WhatsApp
      this.redirectToWhatsApp()
    },

    submitViaIframe(): Promise<void> {
      return new Promise((resolve) => {
        if (!import.meta.client) return resolve()

        const iframeId = 'wa_data_frame'
        let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
        if (iframe) iframe.remove()

        iframe = document.createElement('iframe')
        iframe.id = iframeId
        iframe.name = iframeId
        iframe.style.display = 'none'

        iframe.onload = () => setTimeout(resolve, 300)
        document.body.appendChild(iframe)

        const hiddenForm = document.createElement('form')
        hiddenForm.method = 'POST'
        hiddenForm.action = GOOGLE_APP_SCRIPT_URL
        hiddenForm.target = iframeId
        hiddenForm.style.display = 'none'

        const fields = {
          name: this.name,
          phone: this.phone,
          checkIn: this.checkIn,
          checkOut: this.checkOut,
          roomType: this.roomTypeValue,
          roomSummary: this.roomSummary,
          roomCount: String(this.totalRoomCount),
          singleRoomCount: String(this.singleRoomCount),
          doubleRoomCount: String(this.doubleRoomCount),
          guestCount: String(this.guestCount),
          stayNights: String(getStayNights(this.checkIn, this.checkOut)),
          breakfast: this.breakfast ? 'Ya' : 'Tidak',
          breakfastValue: String(getBreakfastValue(this.checkIn, this.checkOut, this.guestCount, this.breakfast)),
          totalValue: String(this.totalBookingValue),
          notes: this.notes,
          source: this.source,
          clickId: this.clickId,
          transactionId: useTracking().getOrCreateTrxId(),
          gclid: useTracking().getFromStorage('gclid'),
          wbraid: useTracking().getFromStorage('wbraid'),
          gbraid: useTracking().getFromStorage('gbraid'),
          fbclid: useTracking().getFromStorage('fbclid'),
          campaign: useTracking().getFromStorage('campaign'),
          hashedPhone: useTracking().getFromStorage('hashed_phone'),
        }

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          hiddenForm.appendChild(input)
        })

        document.body.appendChild(hiddenForm)
        hiddenForm.submit()

        // Safety timeout
        setTimeout(resolve, 3500)
      })
    },

    redirectToWhatsApp() {
      if (!import.meta.client) return
      const roomLines = [
        this.singleRoomCount > 0 ? `- Single Bed: ${this.singleRoomCount} kamar` : '',
        this.doubleRoomCount > 0 ? `- Double Bed: ${this.doubleRoomCount} kamar` : '',
      ].filter(Boolean)
      const stayNights = getStayNights(this.checkIn, this.checkOut)
      const totalValue = getTotalBookingValue(
        this.checkIn,
        this.checkOut,
        this.singleRoomCount,
        this.doubleRoomCount,
        this.guestCount,
        this.breakfast,
      )
      const message = [
        '🏨 Reservasi Wisma Apollo',
        '',
        'Halo admin Wisma Apollo, saya ingin reservasi kamar.',
        '',
        '👤 Data Tamu',
        `Nama: ${this.name}`,
        `Nomor WA: ${this.phone}`,
        '',
        '📅 Jadwal Menginap',
        `Check-in: ${this.checkIn}`,
        `Check-out: ${this.checkOut}`,
        `Durasi: ${stayNights} malam`,
        '',
        '🛏️ Detail Kamar',
        ...roomLines,
        `Jumlah kamar: ${this.totalRoomCount}`,
        `Jumlah tamu dewasa: ${this.guestCount}`,
        '',
        '🍽️ Sarapan',
        `Sarapan: ${this.breakfast ? `Ya, ${this.guestCount} pack/orang x ${stayNights} hari` : 'Tidak'}`,
        '',
        '💰 Total Estimasi',
        `Total: ${formatRupiah(totalValue)}`,
        '',
        '📝 Catatan Tamu',
        `Catatan: ${this.notes || '-'}`,
        '',
        'ℹ️ Info Kamar',
        'Semua kamar non-smoking. Merokok tersedia di area luar.',
        '',
        '✅ Status Reservasi',
        'Mohon dibantu cek ketersediaan kamar untuk tanggal di atas.',
        'Jika kamar tersedia, reservasi resmi diterima setelah pembayaran masuk dan dikonfirmasi admin.',
        '',
        'Terima kasih.'
      ].join('\n')

      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
      try {
        sessionStorage.setItem(LAST_WA_URL_KEY, waUrl)
        sessionStorage.setItem(LAST_WA_MESSAGE_KEY, message)
        sessionStorage.setItem(LAST_BOOKING_PAYLOAD_KEY, JSON.stringify({
          name: this.name,
          phone: this.phone,
          checkIn: this.checkIn,
          checkOut: this.checkOut,
          roomSummary: this.roomSummary,
          roomCount: this.totalRoomCount,
          guestCount: this.guestCount,
          breakfast: this.breakfast,
          totalValue,
          transactionId: useTracking().getOrCreateTrxId(),
        }))
      } catch {
        // Ignore storage failures in strict/private browser modes.
      }

      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => {
        window.location.href = '/thanks'
      }, 250)
      setTimeout(() => {
        this.isSubmitting = false
        this.name = ''
        this.phone = ''
        this.checkIn = ''
        this.checkOut = ''
        this.roomType = 'single'
        this.roomCount = 1
        this.singleRoomCount = 1
        this.doubleRoomCount = 0
        this.guestCount = 1
        this.breakfast = false
        this.notes = ''
        this.closeModal()
      }, 1000)
    },
  },

  getters: {
    totalRoomCount: (state) => getTotalRoomCount(state.singleRoomCount, state.doubleRoomCount),
    roomSummary: (state) => getRoomSummary(state.singleRoomCount, state.doubleRoomCount),
    roomTypeValue: (state) => getRoomTypeValue(state.singleRoomCount, state.doubleRoomCount),
    roomValue: (state) => getRoomValue(state.checkIn, state.checkOut, state.singleRoomCount, state.doubleRoomCount),
    totalBookingValue: (state) => getTotalBookingValue(
      state.checkIn,
      state.checkOut,
      state.singleRoomCount,
      state.doubleRoomCount,
      state.guestCount,
      state.breakfast,
    ),
  },
})
