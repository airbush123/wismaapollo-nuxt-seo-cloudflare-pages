<template>
  <div>
    <HeroSection />
    <PromoStrip />
    <AboutSection />
    <FacilitiesSection />
    <RoomCards />
    <GallerySection />
    <TestimonialSection />
    <MapSection />
  </div>
</template>

<script setup lang="ts">
useScrollAnimation()
useTracking()

useHead({
  link: [
    { rel: 'canonical', href: 'https://wisma-apollo.my.id/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: 'Wisma Apollo Kuala Kurun',
        description: 'Penginapan Kuala Kurun & Hotel Kuala Kurun terbaik. Kamar bersih, AC, WiFi gratis, kedap suara. Harga mulai Rp200.000/malam.',
        url: 'https://wisma-apollo.my.id/',
        telephone: '+62818232021',
        image: 'https://wisma-apollo.my.id/images/hero.webp',
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
          latitude: '-1.4683',
          longitude: '113.8860',
        },
        priceRange: 'Rp200.000 - Rp250.000',
        starRating: { '@type': 'Rating', ratingValue: '5' },
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'WiFi Gratis', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'AC', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'TV Android 32 inch', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Kamar Mandi Dalam', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Kedap Suara', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Parkir Luas', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Keamanan 24 Jam', value: true },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          reviewCount: '15',
          bestRating: '5',
        },
      }),
    },
  ],
})
</script>
