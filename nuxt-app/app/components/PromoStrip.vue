<template>
  <div class="promo-strip anim-up" role="status" aria-live="polite">
    <span class="promo-fire" aria-hidden="true">🔥</span>
    <div>
      <strong>{{ $t('promo.title') }}</strong>
      <p>{{ $t('promo.text') }} <em>{{ $t('promo.price') }}</em></p>
    </div>
  </div>
</template>
