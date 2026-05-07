export function useTracking() {
  if (!import.meta.client) return

  let gtmLoaded = false
  let googleAdsLoaded = false

  function loadGTM() {
    if (gtmLoaded) return
    gtmLoaded = true

    const w = window as any
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5995VJ5B'
    document.head.appendChild(script)
  }

  function loadGoogleAds() {
    if (googleAdsLoaded) return
    googleAdsLoaded = true

    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11473033484'
    script.async = true
    document.head.appendChild(script)

    const w = window as any
    w.dataLayer = w.dataLayer || []
    function gtag(...args: any[]) { w.dataLayer.push(args) }
    w.gtag = gtag

    gtag('js', new Date())
    gtag('config', 'AW-11473033484')
  }

  function initTracking() {
    const events = ['scroll', 'mousemove', 'touchstart', 'click']

    const handler = () => {
      loadGTM()
      loadGoogleAds()
      events.forEach((e) => window.removeEventListener(e, handler))
    }

    events.forEach((e) => {
      window.addEventListener(e, handler, { once: true, passive: true })
    })

    // Fallback: load after 3.5 seconds
    setTimeout(handler, 3500)
  }

  onMounted(() => {
    initTracking()
  })
}
