<template>
  <a href="#main-content" class="skip-link" @click.prevent="skipToContent">
    {{ $t('common.skipToContent') }}
  </a>
</template>

<script setup lang="ts">
function skipToContent() {
  const main = document.getElementById('main-content')
  if (main) {
    main.focus()
    main.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
