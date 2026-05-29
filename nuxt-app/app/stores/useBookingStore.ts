import { defineStore } from 'pinia'

const BOOKING_LEAD_URL = '/api/webhook'
const WA_NUMBER = '62818232021'
const BREAKFAST_PRICE = 25000
const SINGLE_ROOM_PRICE = 200000
const DOUBLE_ROOM_PRICE = 250000
const SINGLE_ROOM_LIMIT = 3
const DOUBLE_ROOM_LIMIT = 1
const SINGLE_ADULT_CAPACITY = 2
const DOUBLE_ADULT_CAPACITY = 3
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

function getCurrentLocale() {
  if (!import.meta.client) return 'id'
  if (window.location.pathname.startsWith('/en')) return 'en'
  if (window.location.pathname.startsWith('/zh')) return 'zh'
  return 'id'
}

function translateBooking(key: string, fallback: string, params: Record<string, unknown> = {}) {
  try {
    const nuxtApp = useNuxtApp()
    const translated = (nuxtApp.$i18n as { t?: (key: string, params?: Record<string, unknown>) => string })?.t?.(key, params)
    return translated && translated !== key ? translated : fallback
  } catch {
    return fallback
  }
}

function getCookieValue(name: string) {
  if (typeof document === 'undefined') return ''

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

function buildFbcFromFbclid(fbclid: string) {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : ''
}

function formatSpreadsheetPhone(phone: string) {
  const cleanPhone = phone.trim()
  if (!cleanPhone || cleanPhone.startsWith("'")) return cleanPhone
  return cleanPhone.startsWith('0') ? `'${cleanPhone}` : cleanPhone
}

function getTrafficSource(params: URLSearchParams) {
  const utmSource = (params.get('utm_source') || '').toLowerCase()
  const fbclid = params.get('fbclid') || ''
  const gclid = params.get('gclid') || params.get('GCLID') || ''
  const wbraid = params.get('wbraid') || ''
  const gbraid = params.get('gbraid') || ''

  if (fbclid || ['facebook', 'fb', 'instagram', 'ig', 'meta'].includes(utmSource)) {
    return { source: 'Meta', clickId: fbclid }
  }

  if (gclid || wbraid || gbraid || utmSource === 'google') {
    return { source: 'Google', clickId: gclid || wbraid || gbraid }
  }

  return { source: 'Organic', clickId: '' }
}

function getBookingValidationErrors(data: {
  name: string
  phone: string
  checkIn: string
  checkOut: string
  singleRoomCount: number
  doubleRoomCount: number
  guestCount: number
  notes?: string
}) {
  const errors: Record<string, string> = {}
  const cleanPhone = data.phone.trim()

  if (data.name.trim().length < 2) {
    errors.name = translateBooking('booking.errors.nameMin', 'Nama minimal 2 karakter')
  }

  if (cleanPhone.length < 10) {
    errors.phone = translateBooking('booking.errors.phoneMin', 'Nomor minimal 10 digit')
  } else if (!/^[0-9+\-\s]+$/.test(cleanPhone)) {
    errors.phone = translateBooking('booking.errors.phoneFormat', 'Format nomor tidak valid')
  }

  if (!data.checkIn) {
    errors.checkIn = translateBooking('booking.errors.checkInRequired', 'Tanggal check-in wajib diisi')
  }

  if (!data.checkOut) {
    errors.checkOut = translateBooking('booking.errors.checkOutRequired', 'Tanggal check-out wajib diisi')
  }

  if (data.checkIn && data.checkOut && new Date(`${data.checkOut}T00:00:00`) <= new Date(`${data.checkIn}T00:00:00`)) {
    errors.checkOut = translateBooking('booking.errors.checkOutAfterCheckIn', 'Check-out minimal 1 hari setelah check-in')
  }

  if (data.singleRoomCount < 0) {
    errors.singleRoomCount = translateBooking('booking.errors.singleRoomInvalid', 'Jumlah Single Bed tidak valid')
  } else if (data.singleRoomCount > SINGLE_ROOM_LIMIT) {
    errors.singleRoomCount = translateBooking('booking.errors.singleRoomMax', 'Single Bed maksimal 3 kamar')
  }

  if (data.doubleRoomCount < 0) {
    errors.doubleRoomCount = translateBooking('booking.errors.doubleRoomInvalid', 'Jumlah Double Bed tidak valid')
  } else if (data.doubleRoomCount > DOUBLE_ROOM_LIMIT) {
    errors.doubleRoomCount = translateBooking('booking.errors.doubleRoomMax', 'Double Bed hanya tersedia 1 kamar')
  }

  const totalRooms = data.singleRoomCount + data.doubleRoomCount
  if (totalRooms < 1) {
    errors.singleRoomCount = translateBooking('booking.errors.roomRequired', 'Pilih minimal 1 kamar')
  }

  if (data.guestCount < 1) {
    errors.guestCount = translateBooking('booking.errors.guestMin', 'Minimal 1 tamu dewasa')
  } else if (data.guestCount > 50) {
    errors.guestCount = translateBooking('booking.errors.guestMax', 'Maksimal 50 tamu dewasa')
  } else {
    const adultCapacity = (data.singleRoomCount * SINGLE_ADULT_CAPACITY) + (data.doubleRoomCount * DOUBLE_ADULT_CAPACITY)
    if (adultCapacity > 0 && data.guestCount > adultCapacity) {
      errors.guestCount = translateBooking('booking.errors.guestCapacity', `Maksimal ${adultCapacity} tamu dewasa untuk kombinasi kamar yang dipilih.`, { adults: adultCapacity })
    }
  }

  if ((data.notes || '').length > 300) {
    errors.notes = translateBooking('booking.errors.notesMax', 'Catatan maksimal 300 karakter')
  }

  return errors
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
      this.normalizeRoomCounts(true)
      this.ensureDefaultDates()
      this.isModalOpen = true
      this.errors = {}

      if (import.meta.client) {
        useTracking().trackContact(roomType ? `booking_open_${roomType}` : 'booking_open')
      }
    },

    closeModal() {
      this.isModalOpen = false
      this.errors = {}
    },

    setPrimaryRoomType(roomType: 'single' | 'double') {
      this.roomType = roomType
      this.singleRoomCount = roomType === 'single' ? 1 : 0
      this.doubleRoomCount = roomType === 'double' ? 1 : 0
      this.normalizeRoomCounts(true)
    },

    setRoomCount(type: 'single' | 'double', count: number) {
      if (type === 'single') {
        this.singleRoomCount = count
      } else {
        this.doubleRoomCount = count
      }
      this.normalizeRoomCounts(false, type === 'single' ? 'double' : 'single')
    },

    normalizeRoomCounts(enforceMinimum = false, fallbackType?: 'single' | 'double') {
      this.singleRoomCount = Math.min(Math.max(Number(this.singleRoomCount) || 0, 0), SINGLE_ROOM_LIMIT)
      this.doubleRoomCount = Math.min(Math.max(Number(this.doubleRoomCount) || 0, 0), DOUBLE_ROOM_LIMIT)

      if (this.singleRoomCount + this.doubleRoomCount < 1) {
        if (fallbackType === 'double') {
          this.doubleRoomCount = 1
        } else if (fallbackType === 'single' || enforceMinimum) {
          this.singleRoomCount = 1
        }
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
        const traffic = getTrafficSource(urlParams)

        if (traffic.source !== 'Organic') {
          this.source = traffic.source
          this.clickId = traffic.clickId
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
      const errors = getBookingValidationErrors({
        name: this.name,
        phone: this.phone,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        singleRoomCount: Number(this.singleRoomCount) || 0,
        doubleRoomCount: Number(this.doubleRoomCount) || 0,
        guestCount: Number(this.guestCount) || 0,
        notes: this.notes,
      })

      this.errors = errors
      return Object.keys(errors).length === 0
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

      const leadPayload = {
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
      }

      this.submitBookingLead(leadPayload).catch(() => {
        // Do not block the guest from continuing to WhatsApp if webhook delivery is slow.
      })
      tracking.trackLead(leadPayload).catch(() => {
        // Tracking is best-effort and should never slow the booking flow.
      })

      this.redirectToWhatsApp()
    },

    getLeadFields(eventId = '', fbp = '', fbc = '') {
      const tracking = useTracking()

      return {
        submittedAt: new Date().toISOString(),
        name: this.name,
        phone: formatSpreadsheetPhone(this.phone),
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
        transactionId: tracking.getOrCreateTrxId(),
        eventId,
        pageLocation: import.meta.client ? window.location.href : '',
        gclid: tracking.getFromStorage('gclid'),
        wbraid: tracking.getFromStorage('wbraid'),
        gbraid: tracking.getFromStorage('gbraid'),
        fbclid: tracking.getFromStorage('fbclid'),
        fbp,
        fbc,
        campaign: tracking.getFromStorage('campaign'),
        hashedPhone: tracking.getFromStorage('hashed_phone'),
        metaHashedPhone: tracking.getFromStorage('meta_hashed_phone'),
      }
    },

    async submitBookingLead(leadPayload: Record<string, unknown>) {
      if (!import.meta.client) return

      const tracking = useTracking()
      const eventName = 'wisma_lead'
      const eventId = `${tracking.getOrCreateTrxId()}-${eventName}`
      const fbp = getCookieValue('_fbp')
      const fbc = getCookieValue('_fbc') || buildFbcFromFbclid(tracking.getFromStorage('fbclid'))
      const fields = this.getLeadFields(eventId, fbp, fbc)
      const response = await fetch(BOOKING_LEAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        keepalive: true,
        body: new URLSearchParams(fields).toString(),
      })

      if (!response.ok) {
        throw new Error('Booking lead submit failed')
      }
    },

    redirectToWhatsApp() {
      if (!import.meta.client) return
      const singleRoomName = translateBooking('booking.roomTypeNames.single', 'Single Bed')
      const doubleRoomName = translateBooking('booking.roomTypeNames.double', 'Double Bed')
      const roomUnit = translateBooking('booking.roomUnit', 'kamar')
      const roomLines = [
        this.singleRoomCount > 0 ? `- ${singleRoomName}: ${this.singleRoomCount} ${roomUnit}` : '',
        this.doubleRoomCount > 0 ? `- ${doubleRoomName}: ${this.doubleRoomCount} ${roomUnit}` : '',
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
      const breakfastText = this.breakfast
        ? translateBooking('booking.whatsapp.breakfastYes', `Ya, ${this.guestCount} pack/orang x ${stayNights} hari`, {
            guests: this.guestCount,
            nights: stayNights,
          })
        : translateBooking('booking.whatsapp.no', 'Tidak')
      const message = [
        translateBooking('booking.whatsapp.title', 'Reservasi Wisma Apollo'),
        '',
        translateBooking('booking.whatsapp.intro', 'Halo admin Wisma Apollo, saya ingin reservasi kamar.'),
        '',
        translateBooking('booking.whatsapp.guestData', 'Data Tamu'),
        `${translateBooking('booking.whatsapp.name', 'Nama')}: ${this.name}`,
        `${translateBooking('booking.whatsapp.phone', 'Nomor WA')}: ${this.phone}`,
        '',
        translateBooking('booking.whatsapp.staySchedule', 'Jadwal Menginap'),
        `${translateBooking('booking.whatsapp.checkIn', 'Check-in')}: ${this.checkIn}`,
        `${translateBooking('booking.whatsapp.checkOut', 'Check-out')}: ${this.checkOut}`,
        `${translateBooking('booking.whatsapp.duration', 'Durasi')}: ${translateBooking('booking.whatsapp.nights', `${stayNights} malam`, { nights: stayNights })}`,
        '',
        translateBooking('booking.whatsapp.roomDetails', 'Detail Kamar'),
        ...roomLines,
        `${translateBooking('booking.whatsapp.roomCount', 'Jumlah kamar')}: ${this.totalRoomCount}`,
        `${translateBooking('booking.whatsapp.guestCount', 'Jumlah tamu dewasa')}: ${this.guestCount}`,
        '',
        translateBooking('booking.whatsapp.breakfast', 'Sarapan'),
        `${translateBooking('booking.whatsapp.breakfast', 'Sarapan')}: ${breakfastText}`,
        '',
        translateBooking('booking.whatsapp.totalEstimate', 'Total Estimasi'),
        `${translateBooking('booking.whatsapp.total', 'Total')}: ${formatRupiah(totalValue)}`,
        '',
        translateBooking('booking.whatsapp.guestNotes', 'Catatan Tamu'),
        `${translateBooking('booking.whatsapp.notes', 'Catatan')}: ${this.notes || '-'}`,
        '',
        translateBooking('booking.whatsapp.roomInfo', 'Info Kamar'),
        translateBooking('booking.nonSmokingNote', 'Semua kamar non-smoking. Merokok tersedia di area luar.'),
        '',
        translateBooking('booking.whatsapp.reservationStatus', 'Status Reservasi'),
        translateBooking('booking.whatsapp.availabilityRequest', 'Mohon dibantu cek ketersediaan kamar untuk tanggal di atas.'),
        translateBooking('booking.whatsapp.paymentNotice', 'Jika kamar tersedia, reservasi resmi diterima setelah pembayaran masuk dan dikonfirmasi admin.'),
        '',
        translateBooking('booking.whatsapp.thanks', 'Terima kasih.')
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
        const locale = getCurrentLocale()
        window.location.href = locale === 'en' ? '/en/thanks' : locale === 'zh' ? '/zh/' : '/thanks'
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
