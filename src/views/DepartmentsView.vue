<script setup>
import { computed } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'
import { departmentSectors } from '../lib/departmentContent.js'

const departments = computed(() => cmsContent.departments.map((department) => ({ ...department, sectorCount: departmentSectors(department).length })))
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Municipal administration"
      title="Departments and units"
      description="Explore each department’s mandate, sectors, frequently asked questions and official contact routes."
    />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container cms-responsive-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="department in departments"
          :key="department.slug"
          class="cms-department-card group flex min-h-72 flex-col bg-canvas p-6 shadow-[inset_0_0_0_1px_rgba(23,35,58,0.06)] transition duration-500 ease-premium hover:-translate-y-1 hover:bg-white hover:shadow-soft sm:p-8"
          :to="`/departments/${department.slug}`"
        >
          <div class="flex items-center justify-between gap-4"><p class="text-xs font-bold uppercase tracking-[0.14em] text-civic-700">Department</p><span class="text-[0.68rem] font-semibold text-ink/45">{{ department.sectorCount }} {{ department.sectorCount === 1 ? 'sector' : 'sectors' }}</span></div>
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
