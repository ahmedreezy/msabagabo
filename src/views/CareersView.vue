<script setup>
import { PhArrowRight, PhBriefcase, PhStudent } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'

const careerSections = [
  {
    id: 'employment',
    eyebrow: 'Employment opportunities',
    title: 'Municipal vacancies',
    description: 'Official vacancies and application requirements will be published here when recruitment is open.',
    status: 'No active vacancies are currently listed.',
    icon: PhBriefcase,
  },
  {
    id: 'internships',
    eyebrow: 'Internships',
    title: 'Student and graduate placements',
    description: 'Internship and graduate-training notices will include eligibility, required documents and submission instructions.',
    status: 'No internship intake is currently listed.',
    icon: PhStudent,
  },
]
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Work with the council"
      title="Careers"
      description="Find official employment, internship and graduate-training opportunities at the Municipal Council."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-px bg-civic-900/10 lg:grid-cols-2">
        <article v-for="item in careerSections" :id="item.id" :key="item.id" class="scroll-mt-36 bg-white p-7 sm:p-10 lg:p-12">
          <component :is="item.icon" class="text-civic-700" :size="32" />
          <p class="section-kicker mt-9">{{ item.eyebrow }}</p>
          <h2 class="mt-4 text-3xl font-extrabold tracking-[-0.04em]">{{ item.title }}</h2>
          <p class="mt-4 max-w-xl text-sm leading-7 text-ink/62">{{ item.description }}</p>
          <div class="mt-8 bg-sage-50 p-5 text-sm font-bold text-civic-900" role="status">{{ item.status }}</div>
          <RouterLink class="text-link mt-6" to="/contact#feedback">Ask about {{ item.id === 'employment' ? 'recruitment' : 'placements' }} <PhArrowRight :size="16" weight="bold" /></RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>
