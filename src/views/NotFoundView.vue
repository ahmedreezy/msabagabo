<script setup>
import { PhArrowLeft } from '@phosphor-icons/vue'
</script>

<template>
  <section class="bg-canvas py-24 sm:py-32">
    <div class="site-container max-w-2xl">
      <p class="section-kicker">Page not found</p>
      <h1 class="mt-4 text-5xl font-extrabold tracking-[-0.055em] text-ink sm:text-7xl">We could not find that page.</h1>
      <p class="mt-6 text-base leading-7 text-ink/58">The page may have moved or the address may be incorrect.</p>
      <RouterLink class="button-primary mt-8" to="/"><PhArrowLeft :size="17" weight="bold" /> Return home</RouterLink>
    </div>
  </section>
</template>

