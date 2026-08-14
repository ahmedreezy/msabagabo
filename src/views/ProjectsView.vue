<script setup>
import { computed } from 'vue'
import { PhArrowUpRight } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'

const projects = computed(() => cmsContent.projects)
</script>

<template>
  <div>
    <PageIntro eyebrow="Development and infrastructure" title="Projects" description="Follow municipal investments in roads, education and public infrastructure." />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container cms-responsive-grid grid gap-6 lg:grid-cols-3">
        <article v-for="project in projects" :key="project.title" class="cms-project-card overflow-hidden bg-canvas shadow-soft">
          <img class="aspect-[4/3] w-full object-cover" :src="project.image" :alt="project.title" />
          <div class="cms-project-card__body p-6">
            <div class="cms-card-meta flex items-center justify-between gap-4">
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-civic-700">{{ project.sector }}</p>
              <span class="bg-sage-100 px-2.5 py-1 text-[0.65rem] font-bold text-civic-800">{{ project.status }}</span>
            </div>
            <h2 class="mt-4 text-xl font-extrabold tracking-[-0.03em]">{{ project.title }}</h2>
            <button class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-civic-700" type="button">Project details <PhArrowUpRight :size="16" weight="bold" /></button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
