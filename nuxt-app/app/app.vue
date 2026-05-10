<script setup lang="ts">
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "Wisma Apollo Kuala Kurun",
        "description": "Penginapan nyaman dan bersih di pusat kota Kuala Kurun, Gunung Mas.",
        "image": "https://wisma-apollo.my.id/images/hero.webp",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Letjend S. Parman",
          "addressLocality": "Kuala Kurun",
          "addressRegion": "Kalimantan Tengah",
          "postalCode": "74511",
          "addressCountry": "ID"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -0.8441, 
          "longitude": 113.8444
        },
        "url": "https://wisma-apollo.my.id",
        "telephone": "+62818232021",
        "priceRange": "Rp 250.000 - Rp 300.000",
        "starRating": {
          "@type": "Rating",
          "ratingValue": "4"
        }
      })
    }
  ]
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
