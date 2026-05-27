<template>
  <section id="tentang" class="section" role="region" :aria-labelledby="'about-title'">
    <div class="container anim-up">
      <div class="about-layout">
        <div class="about-media">
          <NuxtImg
            src="/images/about-lobby.webp"
            alt="Lobby dan area masuk Wisma Apollo Kuala Kurun"
            width="560"
            height="420"
            loading="lazy"
          />
        </div>

        <div class="about-copy">
          <span class="label">{{ $t('about.label') }}</span>
          <h2 id="about-title">{{ $t('about.title') }}</h2>
          <div class="about-media-mobile">
            <NuxtImg
              src="/images/about-lobby-mobile.webp"
              alt="Lobby Wisma Apollo dengan area resepsionis dan sofa tunggu"
              width="370"
              height="278"
              sizes="370px"
              densities="1x"
              quality="72"
              loading="lazy"
            />
          </div>
          <p class="desc">{{ $t('about.desc1') }}</p>
          <p class="desc">{{ $t('about.desc2') }}</p>
          <p class="desc">{{ $t('about.desc3') }}</p>
        </div>
      </div>

      <div class="usp-row" role="list">
        <div class="usp" role="listitem">
          <div class="usp-icon" aria-hidden="true">📍</div>
          <h3>{{ $t('about.usp.location.title') }}</h3>
          <p>{{ $t('about.usp.location.desc') }}</p>
        </div>
        <div class="usp" role="listitem">
          <div class="usp-icon" aria-hidden="true">🔇</div>
          <h3>{{ $t('about.usp.soundproof.title') }}</h3>
          <p>{{ $t('about.usp.soundproof.desc') }}</p>
        </div>
        <div class="usp" role="listitem">
          <div class="usp-icon" aria-hidden="true">🛏️</div>
          <h3>{{ $t('about.usp.bed.title') }}</h3>
          <p>{{ $t('about.usp.bed.desc') }}</p>
        </div>
        <div class="usp" role="listitem">
          <div class="usp-icon" aria-hidden="true">🧹</div>
          <h3>{{ $t('about.usp.clean.title') }}</h3>
          <p>{{ $t('about.usp.clean.desc') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
