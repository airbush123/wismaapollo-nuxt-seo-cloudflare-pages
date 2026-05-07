export function useScrollAnimation() {
  if (!import.meta.client) return

  onMounted(() => {
    const els = document.querySelectorAll('.anim-up')

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible')
              obs.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      els.forEach((el) => obs.observe(el))
    } else {
      els.forEach((el) => el.classList.add('visible'))
    }
  })
}
