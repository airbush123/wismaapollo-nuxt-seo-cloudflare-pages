<template>
  <div class="promo-strip anim-up" role="status" aria-live="polite">
    <div class="promo-static">
      <span class="promo-fire" aria-hidden="true">&#128293;</span>
      <div>
        <strong>{{ $t('promo.title') }}</strong>
        <p>{{ $t('promo.text') }} <em>{{ $t('promo.price') }}</em></p>
      </div>
    </div>

    <div class="promo-marquee" aria-hidden="true">
      <div class="promo-marquee-row">
        <div class="promo-marquee-track">
          <span class="promo-marquee-item">
            <span class="promo-marquee-icon">&#128293;</span>
            <span class="promo-marquee-copy">
              <strong>{{ $t('promo.title') }}</strong>
              <small>{{ $t('promo.text') }} <em>{{ $t('promo.price') }}</em></small>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
