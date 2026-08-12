<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="page-intro">
    <div class="site-container py-14 sm:py-18 lg:py-22">
      <nav class="mb-9 flex items-center gap-2 text-xs font-semibold text-civic-700" aria-label="Breadcrumb">
        <RouterLink class="hover:text-orange-600" to="/">Home</RouterLink>
        <span aria-hidden="true">/</span>
        <span class="text-ink/50"><slot name="breadcrumb">{{ title }}</slot></span>
      </nav>
      <div class="max-w-3xl">
        <p v-if="eyebrow" class="section-kicker">{{ eyebrow }}</p>
        <h1 class="mt-4 text-[clamp(2.35rem,6vw,4.8rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-ink">{{ title }}</h1>
        <p v-if="description" class="mt-6 max-w-2xl text-base leading-7 text-ink/62 sm:text-lg">{{ description }}</p>
      </div>
    </div>
  </section>
</template>

