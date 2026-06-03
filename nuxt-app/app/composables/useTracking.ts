const STORAGE_PREFIX = 'wisma_'
const SITE_URL = 'https://wisma-apollo.my.id'
const PRODUCT_NAME = 'Wisma Apollo Kuala Kurun'
const CURRENCY = 'IDR'
const GTM_CONTAINER_ID = 'GTM-5995VJ5B'
const GOOGLE_ADS_ID = '18107085431'
const META_PIXEL_ID = '2098215477608895'
const BOOKING_TTL_MS = 24 * 60 * 60 * 1000
const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000
const BOOKING_KEYS = ['trx_id', 'hashed_phone', 'meta_hashed_phone']

const FUNNEL_EVENTS = {
  pv: {
    name: 'wisma_pv',
    label: 'DLj_COy4rrgcEPfkkLpD',
    value: 100
  },
  vc: {
    name: 'wisma_vc',
    label: 'FrBUCM3jr7gcEPfkkLpD',
    value: 200
  },
  contact: {
    name: 'wisma_kontak',
    label: 'gH-uCLSVsLgcEPfkkLpD',
    value: 300
  },
  atc: {
    name: 'wisma_atc',
    label: '45vBCNiPrrgcEPfkkLpD',
    value: 500
  },
  lead: {
    name: 'wisma_lead',
    label: 'bo-PCNi5sLgcEPfkkLpD',
    value: 5000
  },
  userData: {
    name: 'wisma_user_data',
    value: 0
  }
} as const

type TrackingPayload = Record<string, unknown>

let gtmLoaded = false
let gtmLoadPromise: Promise<void> | null = null
let metaPixelLoaded = false
let metaPixelLoadPromise: Promise<void> | null = null
let landingPvSent = false
let landingVcSent = false
let contactSent = false
let addToCartSentForTrx = ''
let leadSentForTrx = ''
let vcScrollHandler: (() => void) | null = null
let vcScrollRaf = 0
let vcObserver: IntersectionObserver | null = null
let lastHashedPhone = ''

export function useTracking() {
  const hasWindow = () => typeof window !== 'undefined'

  const getFromStorage = (key: string): string => {
    if (!hasWindow()) return ''

    try {
      const expiresAt = Number(localStorage.getItem(`${STORAGE_PREFIX}${key}_expires_at`) || 0)
      if (!expiresAt && BOOKING_KEYS.includes(key) && localStorage.getItem(`${STORAGE_PREFIX}${key}`)) {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
        return ''
      }

      if (expiresAt && Date.now() > expiresAt) {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
        localStorage.removeItem(`${STORAGE_PREFIX}${key}_expires_at`)
        return ''
      }

      return localStorage.getItem(`${STORAGE_PREFIX}${key}`) || ''
    } catch {
      return ''
    }
  }

  const setToStorage = (key: string, value: string, ttlMs?: number) => {
    if (!hasWindow()) return

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, value)
      if (ttlMs) {
        localStorage.setItem(`${STORAGE_PREFIX}${key}_expires_at`, String(Date.now() + ttlMs))
      }
    } catch {
      // Ignore storage failures in strict/private browser modes.
    }
  }

  const removeFromStorage = (key: string) => {
    if (!hasWindow()) return

    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      localStorage.removeItem(`${STORAGE_PREFIX}${key}_expires_at`)
    } catch {
      // Ignore storage failures in strict/private browser modes.
    }
  }

  const getPageLocation = (): string => {
    if (!hasWindow()) return SITE_URL
    return new URL(`${window.location.pathname}${window.location.search}`, SITE_URL).toString()
  }

  const getOrCreateTrxId = (): string => {
    let trxId = getFromStorage('trx_id')

    if (!trxId) {
      const rand = Math.random().toString(36).substring(2, 7)
      trxId = `TRX-${Date.now()}-${rand}`
      setToStorage('trx_id', trxId, BOOKING_TTL_MS)
    }

    return trxId
  }

  const captureClickIds = () => {
    if (!hasWindow()) return

    const params = new URLSearchParams(window.location.search)
    const gclid = params.get('gclid') || params.get('GCLID') || ''
    const wbraid = params.get('wbraid') || ''
    const gbraid = params.get('gbraid') || ''
    const fbclid = params.get('fbclid') || ''
    const campaign = params.get('p') || params.get('utm_campaign') || ''

    if (gclid) setToStorage('gclid', gclid, ATTRIBUTION_TTL_MS)
    if (wbraid) setToStorage('wbraid', wbraid, ATTRIBUTION_TTL_MS)
    if (gbraid) setToStorage('gbraid', gbraid, ATTRIBUTION_TTL_MS)
    if (fbclid) setToStorage('fbclid', fbclid, ATTRIBUTION_TTL_MS)
    if (campaign) setToStorage('campaign', campaign, ATTRIBUTION_TTL_MS)
  }

  const getClickId = (): string => getFromStorage('gclid') || getFromStorage('wbraid') || getFromStorage('gbraid')

  const detectDevice = (): string => {
    if (typeof navigator === 'undefined') return 'Unknown'

    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone'
    if (/Android/.test(ua)) return 'Android'
    if (/Mobile|IEMobile|Opera Mini/i.test(ua)) return 'Mobile'
    return 'Desktop'
  }

  const isMobileViewport = (): boolean => {
    if (!hasWindow()) return false

    return window.matchMedia('(max-width: 720px)').matches || detectDevice() !== 'Desktop'
  }

  const normalizePhoneForAds = (rawPhone: string): string => {
    let cleaned = rawPhone.replace(/[^0-9]/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = `62${cleaned.substring(1)}`
    }

    if (!cleaned.startsWith('62')) {
      cleaned = `62${cleaned}`
    }

    return `+${cleaned}`
  }

  const hashSha256 = async (input: string): Promise<string> => {
    if (typeof crypto === 'undefined' || !crypto.subtle) return ''

    const data = new TextEncoder().encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const hashPhone = async (rawPhone: string): Promise<string> => hashSha256(normalizePhoneForAds(rawPhone))

  const normalizePhoneForMeta = (rawPhone: string): string => {
    let cleaned = rawPhone.replace(/[^0-9]/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = `62${cleaned.substring(1)}`
    }

    if (!cleaned.startsWith('62')) {
      cleaned = `62${cleaned}`
    }

    return cleaned
  }

  const hashMetaPhone = async (rawPhone: string): Promise<string> => hashSha256(normalizePhoneForMeta(rawPhone))

  const ensureDataLayer = (): any[] => {
    if (!hasWindow()) return []

    const appWindow = window as any
    appWindow.dataLayer = appWindow.dataLayer || []
    return appWindow.dataLayer
  }

  const buildBasePayload = (value = 0): TrackingPayload => {
    const trxId = getOrCreateTrxId()
    const hashedPhone = getFromStorage('hashed_phone')

    const payload: TrackingPayload = {
      transaction_id: trxId,
      trx_id: trxId,
      gclid: getFromStorage('gclid'),
      wbraid: getFromStorage('wbraid'),
      gbraid: getFromStorage('gbraid'),
      fbclid: getFromStorage('fbclid'),
      campaign: getFromStorage('campaign'),
      device: detectDevice(),
      page_location: getPageLocation(),
      page_hostname: new URL(SITE_URL).hostname,
      product_name: PRODUCT_NAME,
      product_value: value,
      value,
      currency: CURRENCY
    }

    if (hashedPhone) {
      payload.hashed_phone = hashedPhone
      payload.sha256_phone_number = hashedPhone
      payload.phone_number = hashedPhone
      payload.user_data = {
        sha256_phone_number: [hashedPhone]
      }
    }

    return payload
  }

  const pushDataLayer = (payload: TrackingPayload) => {
    if (!hasWindow()) return
    ensureDataLayer().push(payload)
  }

  const pushTrackingEvent = (
    eventName: string,
    value: number,
    payload: TrackingPayload = {}
  ) => {
    const basePayload = buildBasePayload(value)
    const eventId = getEventId(eventName)
    const fullPayload = {
      ...basePayload,
      ...payload,
      event_id: eventId,
      meta_event_id: eventId,
    }

    pushDataLayer({
      event: eventName,
      conversion_id: GOOGLE_ADS_ID,
      send_to: payload.conversion_label ? `AW-${GOOGLE_ADS_ID}/${payload.conversion_label}` : undefined,
      ...fullPayload
    })

    pushMetaEvent(eventName, value, fullPayload)
  }

  const getGtmDebugParams = (): URLSearchParams => {
    const params = new URLSearchParams()
    if (!hasWindow()) return params

    const currentParams = new URLSearchParams(window.location.search)
    currentParams.forEach((value, key) => {
      if (key === 'gtm_auth' || key.startsWith('gtm_')) {
        params.set(key, value)
      }
    })

    return params
  }

  const isGtmPreviewMode = (): boolean => {
    const params = getGtmDebugParams()
    return params.has('gtm_debug') || params.has('gtm_preview') || params.has('gtm_auth')
  }

  const buildGtmScriptUrl = (): string => {
    const params = getGtmDebugParams()
    params.set('id', GTM_CONTAINER_ID)

    const query = params.toString()
    if (isGtmPreviewMode()) {
      return `https://www.googletagmanager.com/gtm.js?${query}`
    }

    return `/px/gtm/gtm.js?${query}`
  }

  const getEventId = (eventName: string) => `${getOrCreateTrxId()}-${eventName}`

  const getCookie = (name: string): string => {
    if (!hasWindow()) return ''

    const cookie = document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${name}=`))

    return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
  }

  const getFbc = (): string => {
    const storedFbc = getCookie('_fbc')
    if (storedFbc) return storedFbc

    const fbclid = getFromStorage('fbclid')
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : ''
  }

  const loadMetaPixel = (): Promise<void> => {
    if (metaPixelLoadPromise) return metaPixelLoadPromise
    if (!hasWindow()) return Promise.resolve()

    metaPixelLoadPromise = new Promise<void>((resolve) => {
      const appWindow = window as any

      if (appWindow.fbq) {
        metaPixelLoaded = true
        resolve()
        return
      }

      const fbq = function (...args: unknown[]) {
        fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)
      } as any
      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []

      appWindow.fbq = fbq
      appWindow._fbq = fbq

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      script.onload = () => {
        metaPixelLoaded = true
        fbq('set', 'autoConfig', false, META_PIXEL_ID)
        fbq('init', META_PIXEL_ID)
        resolve()
      }
      script.onerror = () => resolve()
      document.head.appendChild(script)
    })

    return metaPixelLoadPromise
  }

  const getMetaEventName = (eventName: string): string => {
    const eventMap: Record<string, string> = {
      [FUNNEL_EVENTS.pv.name]: 'PageView',
      [FUNNEL_EVENTS.vc.name]: 'ViewContent',
      [FUNNEL_EVENTS.contact.name]: 'Contact',
      [FUNNEL_EVENTS.atc.name]: 'AddToCart',
      [FUNNEL_EVENTS.lead.name]: 'Lead',
    }

    return eventMap[eventName] || ''
  }

  const buildMetaCustomData = (value: number, payload: TrackingPayload) => ({
    currency: CURRENCY,
    value,
    content_name: PRODUCT_NAME,
    content_category: 'hotel_booking',
    room_type: payload.room_type,
    room_summary: payload.room_summary,
    room_count: payload.room_count,
    guest_count: payload.guest_count,
    check_in: payload.check_in,
    check_out: payload.check_out,
    stay_nights: payload.stay_nights,
    breakfast: payload.breakfast,
    total_booking_value: payload.total_booking_value,
  })

  const pushMetaEvent = (eventName: string, value: number, payload: TrackingPayload = {}) => {
    const metaEventName = getMetaEventName(eventName)
    if (!metaEventName) return

    const eventId = String(payload.event_id || getEventId(eventName))
    const customData = buildMetaCustomData(value, payload)

    loadMetaPixel().then(() => {
      const appWindow = window as any
      if (!appWindow.fbq || !metaPixelLoaded) return
      appWindow.fbq('track', metaEventName, customData, { eventID: eventId })
    })

    if (['PageView', 'ViewContent', 'Contact', 'AddToCart'].includes(metaEventName)) {
      sendMetaCapiEvent(metaEventName, eventId, customData)
    }
  }

  const sendMetaCapiEvent = (eventName: string, eventId: string, customData: TrackingPayload) => {
    if (!hasWindow()) return

    const metaHashedPhone = getFromStorage('meta_hashed_phone') || getFromStorage('hashed_phone')
    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: {
        ph: metaHashedPhone ? [metaHashedPhone] : undefined,
        fbp: getCookie('_fbp') || undefined,
        fbc: getFbc() || undefined,
      },
      custom_data: customData,
    }

    fetch('/api/booking-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // CAPI is a backup signal; never block the booking flow.
    })
  }

  const syncStoredUserData = () => {
    const hashedPhone = getFromStorage('hashed_phone')
    if (!hashedPhone) return

    pushTrackingEvent(FUNNEL_EVENTS.userData.name, FUNNEL_EVENTS.userData.value, {
      hashed_phone: hashedPhone,
      sha256_phone_number: hashedPhone,
      phone_number: hashedPhone,
      user_data: {
        sha256_phone_number: [hashedPhone]
      }
    })
  }

  const loadGtm = (): Promise<void> => {
    if (gtmLoadPromise) return gtmLoadPromise
    if (!hasWindow()) return Promise.resolve()

    gtmLoadPromise = new Promise<void>((resolve) => {
      if (gtmLoaded) {
        resolve()
        return
      }

      const appWindow = window as any
      const dataLayer = ensureDataLayer()

      if (!appWindow.__wismaGtmBootstrapped) {
        dataLayer.push({
          'gtm.start': Date.now(),
          event: 'gtm.js'
        })
        appWindow.__wismaGtmBootstrapped = true
      }

      const existingScript = document.querySelector(`script[data-gtm-container="${GTM_CONTAINER_ID}"]`)
      if (existingScript) {
        gtmLoaded = true
        syncStoredUserData()
        resolve()
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.dataset.gtmContainer = GTM_CONTAINER_ID
      script.src = buildGtmScriptUrl()
      script.onload = () => {
        gtmLoaded = true
        syncStoredUserData()
        resolve()
      }
      script.onerror = () => {
        gtmLoaded = false
        resolve()
      }

      document.head.appendChild(script)
    })

    return gtmLoadPromise
  }

  const getScrollProgress = (): number => {
    if (!hasWindow() || typeof document === 'undefined') return 0

    const doc = document.documentElement
    const bodyHeight = document.body ? document.body.scrollHeight : 0
    const documentHeight = Math.max(doc.scrollHeight, bodyHeight)
    const scrollableHeight = documentHeight - window.innerHeight

    if (scrollableHeight <= 0) return 100

    return ((window.scrollY || doc.scrollTop || 0) / scrollableHeight) * 100
  }

  const clearVcScrollListener = () => {
    if (!hasWindow()) return

    if (vcScrollHandler) {
      window.removeEventListener('scroll', vcScrollHandler)
      vcScrollHandler = null
    }

    if (vcScrollRaf) {
      window.cancelAnimationFrame(vcScrollRaf)
      vcScrollRaf = 0
    }

    if (vcObserver) {
      vcObserver.disconnect()
      vcObserver = null
    }
  }

  const trackViewContent = () => {
    if (landingVcSent) return

    landingVcSent = true
    clearVcScrollListener()

    loadGtm().then(() => {
      pushTrackingEvent(FUNNEL_EVENTS.vc.name, FUNNEL_EVENTS.vc.value, {
        conversion_label: FUNNEL_EVENTS.vc.label
      })
    })
  }

  const attachVcScrollTracking = () => {
    if (!hasWindow() || landingVcSent || vcScrollHandler || vcObserver) return

    if ('IntersectionObserver' in window) {
      const target = document.querySelector('#kamar') || document.querySelector('#fasilitas') || document.querySelector('main')
      if (target) {
        vcObserver = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              trackViewContent()
            }
          },
          { threshold: 0.01, rootMargin: '0px 0px -35% 0px' }
        )
        vcObserver.observe(target)
        return
      }
    }

    vcScrollHandler = () => {
      if (vcScrollRaf) return

      vcScrollRaf = window.requestAnimationFrame(() => {
        vcScrollRaf = 0
        if (getScrollProgress() >= 50) {
          trackViewContent()
        }
      })
    }

    window.addEventListener('scroll', vcScrollHandler, { passive: true })
  }

  const trackPageView = () => {
    if (landingPvSent) return

    landingPvSent = true
    pushTrackingEvent(FUNNEL_EVENTS.pv.name, FUNNEL_EVENTS.pv.value, {
      conversion_label: FUNNEL_EVENTS.pv.label,
      page_title: PRODUCT_NAME
    })
  }

  const scheduleIdleTrackingLoad = (callback: () => void, timeoutMs = 3500) => {
    const appWindow = window as typeof window & {
      requestIdleCallback?: (handler: () => void, options?: { timeout: number }) => number
    }

    if (typeof appWindow.requestIdleCallback === 'function') {
      appWindow.requestIdleCallback(callback, { timeout: timeoutMs })
      return
    }

    setTimeout(callback, timeoutMs)
  }

  const shouldAutoLoadPassiveTracking = () => {
    return Boolean(getClickId() || getFromStorage('fbclid'))
  }

  const getPassiveTrackingDelay = () => {
    if (shouldAutoLoadPassiveTracking()) return 1000
    if (!hasWindow()) return 3500

    const path = window.location.pathname
    return path === '/' || path === '/en/' || path === '/zh/' ? 8500 : 3500
  }

  const initLandingTracking = () => {
    if (!hasWindow()) return

    getOrCreateTrxId()
    captureClickIds()

    const triggerLoad = () => {
      loadGtm().then(() => {
        trackPageView()
        attachVcScrollTracking()
      })
    }

    if (isGtmPreviewMode()) {
      triggerLoad()
      return
    }

    let triggered = false
    const onInteraction = () => {
      if (triggered) return

      triggered = true
      triggerLoad()
      window.removeEventListener('scroll', onInteraction)
      window.removeEventListener('touchstart', onInteraction)
      window.removeEventListener('mousemove', onInteraction)
      window.removeEventListener('click', onInteraction)
      window.removeEventListener('keydown', onInteraction)
    }

    window.addEventListener('scroll', onInteraction, { passive: true, once: true })
    window.addEventListener('touchstart', onInteraction, { passive: true, once: true })
    window.addEventListener('mousemove', onInteraction, { passive: true, once: true })
    window.addEventListener('click', onInteraction, { passive: true, once: true })
    window.addEventListener('keydown', onInteraction, { passive: true, once: true })

    scheduleIdleTrackingLoad(() => {
      if (triggered) return

      triggered = true
      triggerLoad()
    }, getPassiveTrackingDelay())
  }

  const trackContact = (source = 'whatsapp') => {
    if (contactSent) return

    contactSent = true
    loadGtm().then(() => {
      pushTrackingEvent(FUNNEL_EVENTS.contact.name, FUNNEL_EVENTS.contact.value, {
        conversion_label: FUNNEL_EVENTS.contact.label,
        contact_source: source
      })
    })
  }

  const trackAddToCart = (roomType = '', payload: TrackingPayload = {}) => {
    const trxId = getOrCreateTrxId()
    if (addToCartSentForTrx === trxId) return

    addToCartSentForTrx = trxId
    loadGtm().then(() => {
      trackViewContent()
      pushTrackingEvent(FUNNEL_EVENTS.atc.name, FUNNEL_EVENTS.atc.value, {
        conversion_label: FUNNEL_EVENTS.atc.label,
        room_type: roomType,
        ...payload
      })
    })
  }

  const trackUserData = async (rawPhone: string) => {
    const hashedPhone = await hashPhone(rawPhone)
    if (!hashedPhone || hashedPhone === lastHashedPhone) return hashedPhone

    const metaHashedPhone = await hashMetaPhone(rawPhone)
    lastHashedPhone = hashedPhone
    setToStorage('hashed_phone', hashedPhone, BOOKING_TTL_MS)
    if (metaHashedPhone) setToStorage('meta_hashed_phone', metaHashedPhone, BOOKING_TTL_MS)

    loadGtm().then(() => {
      pushTrackingEvent(FUNNEL_EVENTS.userData.name, FUNNEL_EVENTS.userData.value, {
        hashed_phone: hashedPhone,
        sha256_phone_number: hashedPhone,
        phone_number: hashedPhone,
        user_data: {
          sha256_phone_number: [hashedPhone]
        }
      })
    })

    return hashedPhone
  }

  const trackLead = async (payload: TrackingPayload = {}) => {
    const trxId = getOrCreateTrxId()
    if (leadSentForTrx === trxId) return

    leadSentForTrx = trxId
    await loadGtm()

    pushTrackingEvent(FUNNEL_EVENTS.lead.name, FUNNEL_EVENTS.lead.value, {
      conversion_label: FUNNEL_EVENTS.lead.label,
      ...payload
    })
  }

  const resetTrackingIdentifiers = () => {
    BOOKING_KEYS.forEach(removeFromStorage)
    addToCartSentForTrx = ''
    leadSentForTrx = ''
  }

  const clearBookingSession = () => {
    resetTrackingIdentifiers()

    if (!hasWindow()) return

    try {
      sessionStorage.removeItem('wisma_last_wa_url')
      sessionStorage.removeItem('wisma_last_wa_message')
      sessionStorage.removeItem('wisma_last_booking_payload')
      sessionStorage.removeItem('wa_source')
      sessionStorage.removeItem('wa_click_id')

      document.cookie.split(';').forEach((cookie) => {
        const cookieName = cookie.split('=')[0]?.trim()
        if (!cookieName || !cookieName.startsWith(STORAGE_PREFIX)) return
        document.cookie = `${cookieName}=; Max-Age=0; path=/`
      })
    } catch {
      // Ignore storage failures in strict/private browser modes.
    }
  }

  return {
    initLandingTracking,
    loadGtm,
    captureClickIds,
    getClickId,
    getOrCreateTrxId,
    getFromStorage,
    setToStorage,
    removeFromStorage,
    detectDevice,
    normalizePhoneForAds,
    hashPhone,
    trackContact,
    trackAddToCart,
    trackUserData,
    trackLead,
    trackViewContent,
    resetTrackingIdentifiers,
    clearBookingSession
  }
}
