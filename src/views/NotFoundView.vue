<script setup>
import { PhArrowLeft } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
</script>

<template>
  <div>
    <PageIntro
      page-key="utility-default"
      variant="compact"
      prefer-props
      eyebrow="Page not found"
      title="We could not find that page."
      description="The page may have moved or the address may be incorrect."
    />
    <section class="bg-canvas py-14 sm:py-18">
      <div class="site-container max-w-2xl">
        <RouterLink class="button-primary" to="/"><PhArrowLeft :size="17" weight="bold" /> Return home</RouterLink>
      </div>
    </section>
  </div>
</template>
