import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isMenuOpen: false,
    isScrolled: false,
    isLightboxOpen: false,
    lightboxImage: '',
    lightboxAlt: '',
  }),

  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    closeMenu() {
      this.isMenuOpen = false
    },

    setScrolled(value: boolean) {
      this.isScrolled = value
    },

    openLightbox(src: string, alt: string = '') {
      this.lightboxImage = src
      this.lightboxAlt = alt
      this.isLightboxOpen = true
    },

    closeLightbox() {
      this.isLightboxOpen = false
    },
  },
})
