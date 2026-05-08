<template>
  <section id="testimoni" class="section" role="region" aria-labelledby="testi-title">
    <div class="container anim-up">
      <span class="label">{{ $t('testimonials.label') }}</span>
      <h2 id="testi-title">{{ $t('testimonials.title') }}</h2>

      <article v-for="t in testimonials" :key="t.index" class="testi-card" role="article">
        <div class="testi-header">
          <div class="testi-avatar" :style="{ background: t.color }" aria-hidden="true">{{ t.initial }}</div>
          <div class="testi-info">
            <div class="testi-author">
              <strong>{{ $t(`testimonials.items[${t.index}].name`) }}</strong>
              <span class="google-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                  <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                  <path d="M5.50253 14.3003C5.00057 12.8099 5.00057 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056-0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04"/>
                  <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208-0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
                </svg>
              </span>
            </div>
            <div class="testi-stars" :aria-label="$t('testimonials.ratingAria', { rating: '5' })">★★★★★</div>
          </div>
        </div>
        <p>"{{ $t(`testimonials.items[${t.index}].text`) }}"</p>
        <div class="testi-ratings">
          <span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {{ $t('testimonials.location') }}: <b>5/5</b>
          </span>
          <span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z"/>
            </svg>
            {{ $t('testimonials.room') }}: <b>5/5</b>
          </span>
        </div>
      </article>

      <a
        href="https://www.google.com/travel/search?q=wisma%20apollo&hl=id-ID&gl=id&qs=MidDaGtJcU9uTjY4VEEtSzhoR2cwdlp5OHhNV3h1ZHpSMloySjJFQUU4DUgA&ts=CAEaggEKYhJgCg0vZy8xMWxudzR2Z2J2Ok9XaXNtYSBBcG9sbG8gS3VhbGEgS3VydW4gKFBlbmdpbmFwYW4sIEhvdGVsLCBHdWVzdCBIb3VzZSwgSG9tZXN0YXksIFN0YXljYXRpb24pEhwSFAoHCOoPEAUYGRIHCOoPEAUYGhgBMgQIABAA&ap=KigKEglxKmzdX67yvxFHqlOSP3VcQBISCfXIw1PJ8vC_EUeqU2JNeVxAMAC6AQdyZXZpZXdz"
        target="_blank"
        rel="noopener"
        style="display:block;text-align:center;font-size:0.85rem;font-weight:600;color:#1B4965;margin-top:20px;text-decoration:underline;"
      >{{ $t('testimonials.viewAll') }}</a>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  { index: 0, initial: 'M', color: '#E86A33' },
  { index: 1, initial: 'S', color: '#1B4965' },
  { index: 2, initial: 'P', color: '#2D6A4F' },
]
</script>
