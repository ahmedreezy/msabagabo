<script setup>
import { computed } from 'vue'
import { PhArrowRight, PhDownloadSimple, PhFilePdf } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'

const publications = computed(() => cmsContent.publications)
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Public information"
      title="Open government"
      description="Access municipal plans, budgets, service standards, policies and other public documents."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
        <div>
          <p class="section-kicker">Document library</p>
          <h2 class="section-title mt-4">Council publications</h2>
          <p class="section-description">Published records that help residents understand municipal plans, standards and public spending.</p>
          <RouterLink class="text-link mt-7" to="/news">View council news and notices <PhArrowRight :size="16" weight="bold" /></RouterLink>
        </div>

        <div class="grid gap-3">
          <template v-for="publication in publications" :key="publication.title">
            <a v-if="publication.url" class="group flex items-center gap-4 bg-sage-50 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft" :href="publication.url" :download="publication.fileName || undefined" target="_blank" rel="noreferrer">
              <span class="grid h-11 w-11 shrink-0 place-items-center bg-white text-civic-700"><PhFilePdf :size="22" /></span>
              <span class="min-w-0 flex-1"><strong class="block font-extrabold text-ink">{{ publication.title }}</strong><small class="mt-1 block font-semibold text-ink/45">{{ publication.category }} · {{ publication.format }}</small></span>
              <PhDownloadSimple class="shrink-0 text-ink/30 group-hover:text-civic-700" :size="20" weight="bold" />
            </a>
            <div v-else class="flex items-center gap-4 bg-sage-50 p-5">
              <span class="grid h-11 w-11 shrink-0 place-items-center bg-white text-civic-700"><PhFilePdf :size="22" /></span>
              <span class="min-w-0 flex-1"><strong class="block font-extrabold text-ink">{{ publication.title }}</strong><small class="mt-1 block font-semibold text-ink/45">{{ publication.category }} · {{ publication.format }} · File pending publication</small></span>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
