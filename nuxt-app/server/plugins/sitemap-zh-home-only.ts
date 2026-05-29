export default defineNitroPlugin((nitroApp) => {
  const getPathname = (url: string) => {
    try {
      return new URL(url, 'https://wisma-apollo.my.id').pathname
    } catch {
      return url
    }
  }

  const isZhUrl = (url: string) => {
    const pathname = getPathname(url)
    return pathname === '/zh' || pathname.startsWith('/zh/')
  }

  const isLocaleHomepage = (url: string) => {
    const pathname = getPathname(url).replace(/\/$/, '') || '/'
    return pathname === '/' || pathname === '/en' || pathname === '/zh'
  }

  const isLocaleFaq = (url: string) => {
    const pathname = getPathname(url).replace(/\/$/, '') || '/'
    return pathname === '/faq' || pathname === '/en/faq' || pathname === '/zh/faq'
  }

  const isThreeLocalePage = (url: string) => isLocaleHomepage(url) || isLocaleFaq(url)

  nitroApp.hooks.hook('sitemap:resolved', (ctx) => {
    ctx.urls = ctx.urls
      .filter(entry => !isZhUrl(entry.loc) || isThreeLocalePage(entry.loc))
      .map((entry) => {
        if (isThreeLocalePage(entry.loc) || !entry.alternatives?.length) {
          return entry
        }

        return {
          ...entry,
          alternatives: entry.alternatives.filter(alternative => alternative.hreflang !== 'zh-CN' && !isZhUrl(alternative.href)),
        }
      })
  })

  nitroApp.hooks.hook('sitemap:output', (ctx) => {
    ctx.sitemap = ctx.sitemap.replace(/&amp;amp;/g, '&amp;')
    ctx.sitemap = ctx.sitemap.replace(/\s*<xhtml:link rel="alternate" hreflang="zh-CN" href="([^"]+)" \/>/g, (line, href) => {
      const pathname = getPathname(href).replace(/\/$/, '') || '/'
      return pathname === '/zh' || pathname === '/zh/faq' ? line : ''
    })
  })
})
