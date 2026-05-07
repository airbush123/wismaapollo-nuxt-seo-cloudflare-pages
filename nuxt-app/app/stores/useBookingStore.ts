import { defineStore } from 'pinia'
import { BookingFormSchema } from '~/schemas/booking'
import type { BookingFormData } from '~/schemas/booking'

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2g1_ZDFhthbNDepnazQJu3hze_Cz24odh0Yjj8nf9xppSCQisS3ZK233EQW2s0wflOw/exec'
const WA_NUMBER = '62818232021'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    isModalOpen: false,
    currentWaUrl: `https://wa.me/${WA_NUMBER}`,
    name: '',
    phone: '',
    isSubmitting: false,
    errors: {} as Record<string, string>,
    source: 'Organic' as string,
    clickId: '' as string,
  }),

  actions: {
    openModal(waUrl?: string) {
      if (waUrl) this.currentWaUrl = waUrl
      this.isModalOpen = true
      this.errors = {}
    },

    closeModal() {
      this.isModalOpen = false
      this.errors = {}
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
        } else {
          this.source = sessionStorage.getItem('wa_source') || 'Organic'
          this.clickId = sessionStorage.getItem('wa_click_id') || ''
        }
      } catch {
        // Ignore sessionStorage exceptions in Strict Incognito Mode
      }
    },

    validate(): boolean {
      const result = BookingFormSchema.safeParse({
        name: this.name,
        phone: this.phone,
      })

      if (!result.success) {
        this.errors = {}
        result.error.errors.forEach((err) => {
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

      // Fire tracking events (AdBlock-safe)
      this.fireTrackingEvents()

      // Submit data via hidden iframe
      await this.submitViaIframe()

      // Redirect to WhatsApp
      this.redirectToWhatsApp()
    },

    fireTrackingEvents() {
      if (!import.meta.client) return
      try {
        const w = window as any
        if (typeof w.dataLayer !== 'undefined') {
          w.dataLayer.push({ event: 'generate_lead', lead_source: this.source })
        }
        if (typeof w.fbq !== 'undefined') {
          w.fbq('track', 'Lead')
        }
        if (typeof w.gtag !== 'undefined') {
          w.gtag('event', 'conversion', {
            send_to: 'AW-11473033484/YOUR_CONVERSION_LABEL',
            event_category: 'engagement',
            event_label: 'WhatsApp Form',
          })
        }
      } catch {
        // Tracking blocked, ignoring safely
      }
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
          source: this.source,
          clickId: this.clickId,
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
      window.location.href = this.currentWaUrl
      setTimeout(() => {
        this.isSubmitting = false
        this.name = ''
        this.phone = ''
        this.closeModal()
      }, 1000)
    },
  },
})
