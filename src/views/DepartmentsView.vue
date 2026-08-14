<script setup>
import { computed } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'

const departments = computed(() => cmsContent.departments)
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Municipal administration"
      title="Departments"
      description="Find each department's mandate, legal authority, services, units and contact information."
    />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="department in departments"
          :key="department.slug"
          class="group flex min-h-72 flex-col bg-canvas p-6 shadow-[inset_0_0_0_1px_rgba(17,26,23,0.06)] transition duration-500 ease-premium hover:-translate-y-1 hover:bg-white hover:shadow-soft sm:p-8"
          :to="`/departments/${department.slug}`"
        >
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-civic-700">Department</p>
          <h2 class="mt-5 text-xl font-extrabold leading-tight tracking-[-0.035em] text-ink">{{ department.name }}</h2>
          <p class="mt-4 flex-1 text-sm leading-6 text-ink/56">{{ department.summary }}</p>
          <span class="mt-7 inline-flex items-center gap-2 text-sm font-bold text-civic-700">
            View department
            <PhArrowRight class="transition-transform duration-500 ease-premium group-hover:translate-x-1" :size="17" weight="bold" />
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
