import { defineStore } from 'pinia'
import { BookingFormSchema } from '~/schemas/booking'
import type { BookingFormData } from '~/schemas/booking'

const GOOGLE_APP_SCRIPT_URL = '/api/webhook'
const WA_NUMBER = '62818232021'
const BREAKFAST_PRICE = 25000
const getRoomLimit = (roomType: 'single' | 'double') => roomType === 'single' ? 3 : 1

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
      if (roomType) this.roomType = roomType
      this.normalizeRoomCount()
      this.ensureDefaultDates()
      this.isModalOpen = true
      this.errors = {}

      if (import.meta.client) {
        useTracking().trackAddToCart(this.roomType)
      }
    },

    closeModal() {
      this.isModalOpen = false
      this.errors = {}
    },

    setRoomType(roomType: 'single' | 'double') {
      this.roomType = roomType
      this.normalizeRoomCount()
    },

    normalizeRoomCount() {
      const maxRoomCount = getRoomLimit(this.roomType)
      if (!this.roomCount || this.roomCount < 1) this.roomCount = 1
      if (this.roomCount > maxRoomCount) this.roomCount = maxRoomCount
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
        roomType: this.roomType,
        roomCount: this.roomCount,
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
        room_type: this.roomType,
        room_count: this.roomCount,
        guest_count: this.guestCount,
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
          roomType: this.roomType,
          roomCount: String(this.roomCount),
          guestCount: String(this.guestCount),
          breakfast: this.breakfast ? 'Ya' : 'Tidak',
          breakfastValue: String(getBreakfastValue(this.checkIn, this.checkOut, this.guestCount, this.breakfast)),
          notes: this.notes,
          source: this.source,
          clickId: this.clickId,
          transactionId: useTracking().getOrCreateTrxId(),
          gclid: useTracking().getFromStorage('gclid'),
          wbraid: useTracking().getFromStorage('wbraid'),
          gbraid: useTracking().getFromStorage('gbraid'),
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
      const roomLabel = this.roomType === 'single'
        ? 'Single Bed - Rp200.000/malam'
        : 'Double Bed - Rp250.000/malam'
      const message = [
        'Halo Wisma Apollo, saya ingin reservasi kamar.',
        '',
        `Nama: ${this.name}`,
        `Nomor WA: ${this.phone}`,
        `Check-in: ${this.checkIn}`,
        `Check-out: ${this.checkOut}`,
        `Tipe kamar: ${roomLabel}`,
        'Catatan kamar: Semua kamar non-smoking. Merokok tersedia di area luar.',
        `Jumlah kamar: ${this.roomCount}`,
        `Jumlah tamu: ${this.guestCount}`,
        `Sarapan: ${this.breakfast ? `Ya, ${this.guestCount} pack/orang x ${getStayNights(this.checkIn, this.checkOut)} malam` : 'Tidak'}`,
        `Catatan: ${this.notes || '-'}`,
        '',
        'Terima kasih.'
      ].join('\n')

      window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
      setTimeout(() => {
        this.isSubmitting = false
        this.name = ''
        this.phone = ''
        this.checkIn = ''
        this.checkOut = ''
        this.roomType = 'single'
        this.roomCount = 1
        this.guestCount = 1
        this.breakfast = false
        this.notes = ''
        this.closeModal()
      }, 1000)
    },
  },
})
