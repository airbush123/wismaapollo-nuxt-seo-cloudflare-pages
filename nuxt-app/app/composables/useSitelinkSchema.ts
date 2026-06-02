export const SITE_URL = 'https://wisma-apollo.my.id'
export const LOCAL_BUSINESS_ALIAS = 'Wisma Apollo Kuala Kurun - Penginapan Hotel Guest House Homestay Staycation'

export const PRIMARY_SITELINKS = [
  {
    name: 'Hotel Kuala Kurun',
    url: `${SITE_URL}/hotel-kuala-kurun/`,
    description: 'Halaman utama Wisma Apollo untuk pencarian hotel Kuala Kurun.',
  },
  {
    name: 'Penginapan Kuala Kurun',
    url: `${SITE_URL}/penginapan-kuala-kurun/`,
    description: 'Penginapan bersih dan strategis di pusat Kuala Kurun.',
  },
  {
    name: 'Guest House Kuala Kurun',
    url: `${SITE_URL}/guest-house-kuala-kurun/`,
    description: 'Guest house Kuala Kurun dengan kamar AC, WiFi, dan parkir luas.',
  },
  {
    name: 'Homestay Kuala Kurun',
    url: `${SITE_URL}/homestay-kuala-kurun/`,
    description: 'Homestay nyaman di Kuala Kurun untuk keluarga dan perjalanan singkat.',
  },
  {
    name: 'Tarif Kamar',
    url: `${SITE_URL}/#kamar`,
    description: 'Informasi tipe kamar dan harga menginap di Wisma Apollo.',
  },
  {
    name: 'Galeri Wisma Apollo',
    url: `${SITE_URL}/#galeri`,
    description: 'Foto kamar, fasilitas, dan area Wisma Apollo Kuala Kurun.',
  },
  {
    name: 'FAQ Wisma Apollo',
    url: `${SITE_URL}/faq/`,
    description: 'Pertanyaan umum tentang lokasi, fasilitas, harga, dan reservasi.',
  },
  {
    name: 'Blog Wisma Apollo',
    url: `${SITE_URL}/blog/`,
    description: 'Artikel seputar penginapan, wisata, dan kuliner Kuala Kurun.',
  },
]

export function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Wisma Apollo Kuala Kurun',
    alternateName: [
      'Wisma Apollo',
      LOCAL_BUSINESS_ALIAS,
      'Wisma Apollo Hotel Kuala Kurun',
    ],
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo/wisma-apollo-logo.png`,
      width: 192,
      height: 192,
    },
    sameAs: [
      'https://web.facebook.com/wismaapollokualakurun',
      'https://www.instagram.com/wismaapollokualakurun/',
      'https://x.com/Wismaapollo',
      'https://www.youtube.com/@WismaApolloKualaKurun',
      'https://www.tiktok.com/@wismaapollokualakurun',
      'https://id.pinterest.com/wismaapollokualakurun/',
    ],
  }
}

export function buildHotelSchema() {
  return {
    '@type': ['Hotel', 'LodgingBusiness', 'LocalBusiness'],
    '@id': `${SITE_URL}/#hotel`,
    name: 'Wisma Apollo Kuala Kurun',
    alternateName: [
      'Wisma Apollo',
      'Apollo Kuala Kurun',
      LOCAL_BUSINESS_ALIAS,
      'Wisma Apollo Hotel Kuala Kurun',
      'Wisma Apollo Penginapan Kuala Kurun',
      'Wisma Apollo Guest House Kuala Kurun',
      'Wisma Apollo Homestay Kuala Kurun',
      'Wisma Apollo Staycation Kuala Kurun',
    ],
    description: 'Hotel dan penginapan Kuala Kurun yang bersih, strategis, dan nyaman dengan AC, WiFi gratis, TV Android, kamar mandi dalam, dan parkir luas.',
    url: `${SITE_URL}/`,
    telephone: '+62818232021',
    hasMap: 'https://www.google.com/maps/search/Wisma+Apollo+Kuala+Kurun',
    currenciesAccepted: 'IDR',
    paymentAccepted: 'Cash, Bank Transfer',
    image: [
      `${SITE_URL}/images/hero.webp`,
      `${SITE_URL}/images/gallery/wisma-apollo-hotel-kuala-kurun.webp`,
      `${SITE_URL}/images/gallery/kamar-double-bed-wisma-apollo.webp`,
      `${SITE_URL}/images/gallery/kamar-hotel-murah-kuala-kurun.webp`,
      `${SITE_URL}/images/gallery/kamar-penginapan-kuala-kurun.webp`,
    ],
    checkinTime: '14:00',
    checkoutTime: '12:00',
    priceRange: 'Rp200.000 - Rp250.000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Letjen Soeprapto No.56',
      addressLocality: 'Kuala Kurun',
      addressRegion: 'Kalimantan Tengah',
      postalCode: '74571',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.4683,
      longitude: 113.886,
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'WiFi Gratis', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'AC', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'TV Android 32 inch', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Kamar mandi dalam', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Kedap suara', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Parkir luas', value: true },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '24',
      bestRating: '5',
    },
  }
}

export function buildWebsiteSchema(inLanguage = 'id-ID') {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Wisma Apollo Kuala Kurun',
    alternateName: [
      'Wisma Apollo',
      LOCAL_BUSINESS_ALIAS,
      'Hotel Kuala Kurun',
      'Penginapan Kuala Kurun',
      'Guest House Kuala Kurun',
      'Homestay Kuala Kurun',
      'Staycation Kuala Kurun',
    ],
    url: `${SITE_URL}/`,
    inLanguage,
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: { '@id': `${SITE_URL}/#hotel` },
    hasPart: PRIMARY_SITELINKS.map((item) => ({
      '@type': 'WebPage',
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  }
}

export function buildSiteNavigationSchema() {
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#primary-sitelinks`,
    name: 'Sitelinks Wisma Apollo Kuala Kurun',
    itemListElement: PRIMARY_SITELINKS.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      description: item.description,
      url: item.url,
    })),
  }
}

export function buildWebPageSchema(params: {
  url: string
  name: string
  description: string
  image?: string
  inLanguage?: string
}) {
  return {
    '@type': 'WebPage',
    '@id': `${params.url}#webpage`,
    url: params.url,
    name: params.name,
    description: params.description,
    image: params.image,
    inLanguage: params.inLanguage || 'id-ID',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#hotel` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const currentUrl = items[items.length - 1]?.url || SITE_URL
  const breadcrumbIdBase = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl

  return {
    '@type': 'BreadcrumbList',
    '@id': `${breadcrumbIdBase}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildGraphSchema(items: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': items.filter(Boolean),
  }
}
