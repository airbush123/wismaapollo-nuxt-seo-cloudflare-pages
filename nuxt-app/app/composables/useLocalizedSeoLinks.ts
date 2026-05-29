import { SITE_URL } from './useSitelinkSchema'

type LocaleCode = 'id' | 'en' | 'zh'

const localeHreflang: Record<LocaleCode, string> = {
  id: 'id',
  en: 'en',
  zh: 'zh',
}

function normalizePath(path: string) {
  if (!path || path === '/') return '/'
  return `/${path.replace(/^\/+|\/+$/g, '')}`
}

function localizedUrl(path: string, locale: LocaleCode) {
  const normalizedPath = normalizePath(path)
  const pathWithSlash = normalizedPath === '/' ? '/' : `${normalizedPath}/`

  if (locale === 'id') {
    return `${SITE_URL}${pathWithSlash}`
  }

  return `${SITE_URL}/${locale}${pathWithSlash}`
}

export function canonicalLocalizedPath(path: string, locale: LocaleCode) {
  const [, rawPath = '/', suffix = ''] = path.match(/^([^?#]*)([?#].*)?$/) || []
  const normalizedPath = normalizePath(rawPath)
  const pathWithSlash = normalizedPath === '/' ? '/' : `${normalizedPath}/`

  if (locale === 'id') {
    return `${pathWithSlash}${suffix}`
  }

  return `/${locale}${pathWithSlash}${suffix}`
}

export function useCanonicalLocalePath() {
  const { locale } = useI18n()

  return (path: string) => canonicalLocalizedPath(path, locale.value as LocaleCode)
}

export function buildHreflangLinks(path: string, locales: LocaleCode[]) {
  const normalizedPath = normalizePath(path)

  return [
    ...locales.map(locale => ({
      rel: 'alternate',
      hreflang: localeHreflang[locale],
      href: localizedUrl(normalizedPath, locale),
    })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: localizedUrl(normalizedPath, 'id'),
    },
  ]
}
