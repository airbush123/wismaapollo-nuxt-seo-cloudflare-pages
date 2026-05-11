const STORAGE_PREFIX = 'wisma_'
const SITE_URL = 'https://wisma-apollo.my.id'
const PRODUCT_NAME = 'Wisma Apollo Kuala Kurun'
const CURRENCY = 'IDR'
const GTM_CONTAINER_ID = 'GTM-5995VJ5B'
const GOOGLE_ADS_ID = '11473033484'

const FUNNEL_EVENTS = {
  pv: {
    name: 'wisma_pv',
    label: 'egfBCJearascEIyy4t4q',
    value: 100
  },
  vc: {
    name: 'wisma_vc',
    label: '6VFrCKurrascEIyy4t4q',
    value: 200
  },
  contact: {
    name: 'wisma_kontak',
    label: 'bIBmCPfqk6scEIyy4t4q',
    value: 300
  },
  atc: {
    name: 'wisma_atc',
    label: '1E3pCMmBlKscEIyy4t4q',
    value: 500
  },
  lead: {
    name: 'wisma_lead',
    label: '11473033484',
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
let landingPvSent = false
let landingVcSent = false
let contactSent = false
let addToCartSent = false
let leadSent = false
let vcScrollHandler: (() => void) | null = null
let lastHashedPhone = ''

export function useTracking() {
  const hasWindow = () => typeof window !== 'undefined'

  const getFromStorage = (key: string): string => {
    if (!hasWindow()) return ''

    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${key}`) || ''
    } catch {
      return ''
    }
  }

  const setToStorage = (key: string, value: string) => {
    if (!hasWindow()) return

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, value)
    } catch {
      // Ignore storage failures in strict/private browser modes.
    }
  }

  const removeFromStorage = (key: string) => {
    if (!hasWindow()) return

    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
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
      setToStorage('trx_id', trxId)
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

    if (gclid) setToStorage('gclid', gclid)
    if (wbraid) setToStorage('wbraid', wbraid)
    if (gbraid) setToStorage('gbraid', gbraid)
    if (fbclid) setToStorage('fbclid', fbclid)
    if (campaign) setToStorage('campaign', campaign)
  }

  const getClickId = (): string => getFromStorage('gclid') || getFromStorage('wbraid') || getFromStorage('gbraid')

  const detectDevice = (): string => {
    if (typeof navigator === 'undefined') return 'Unknown'

    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone'
    if (/Android/.test(ua)) return 'Android'
    return 'Desktop'
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
    pushDataLayer({
      event: eventName,
      conversion_id: GOOGLE_ADS_ID,
      send_to: payload.conversion_label ? `AW-${GOOGLE_ADS_ID}/${payload.conversion_label}` : undefined,
      ...buildBasePayload(value),
      ...payload
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
      script.src = `/px/gtm/gtm.js?id=${GTM_CONTAINER_ID}`
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
    if (!hasWindow() || !vcScrollHandler) return

    window.removeEventListener('scroll', vcScrollHandler)
    vcScrollHandler = null
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
    if (!hasWindow() || landingVcSent || vcScrollHandler) return

    vcScrollHandler = () => {
      if (getScrollProgress() >= 50) {
        trackViewContent()
      }
    }

    window.addEventListener('scroll', vcScrollHandler, { passive: true })
    vcScrollHandler()
  }

  const trackPageView = () => {
    if (landingPvSent) return

    landingPvSent = true
    pushTrackingEvent(FUNNEL_EVENTS.pv.name, FUNNEL_EVENTS.pv.value, {
      conversion_label: FUNNEL_EVENTS.pv.label,
      page_title: PRODUCT_NAME
    })
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

    setTimeout(() => {
      if (!triggered) {
        triggered = true
        triggerLoad()
      }
    }, 8500)
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

  const trackAddToCart = (roomType = '') => {
    if (addToCartSent) return

    addToCartSent = true
    loadGtm().then(() => {
      trackViewContent()
      pushTrackingEvent(FUNNEL_EVENTS.atc.name, FUNNEL_EVENTS.atc.value, {
        conversion_label: FUNNEL_EVENTS.atc.label,
        room_type: roomType
      })
    })
  }

  const trackUserData = async (rawPhone: string) => {
    const hashedPhone = await hashPhone(rawPhone)
    if (!hashedPhone || hashedPhone === lastHashedPhone) return hashedPhone

    lastHashedPhone = hashedPhone
    setToStorage('hashed_phone', hashedPhone)

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
    if (leadSent) return

    leadSent = true
    await loadGtm()

    pushTrackingEvent(FUNNEL_EVENTS.lead.name, FUNNEL_EVENTS.lead.value, {
      conversion_label: FUNNEL_EVENTS.lead.label,
      ...payload
    })
  }

  const resetTrackingIdentifiers = () => {
    removeFromStorage('trx_id')
    removeFromStorage('hashed_phone')
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
    resetTrackingIdentifiers
  }
}
