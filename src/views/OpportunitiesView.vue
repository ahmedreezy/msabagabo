<script setup>
import { PhArrowRight, PhBriefcase, PhFileText, PhStudent } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'

const opportunities = [
  { title: 'Bids & tenders', description: 'Current procurement notices, bid documents and submission information.', icon: PhFileText },
  { title: 'Jobs', description: 'Municipal vacancies and official application requirements.', icon: PhBriefcase },
  { title: 'Internships & trainees', description: 'Learning opportunities for university and college students.', icon: PhStudent },
]
</script>

<template>
  <div>
    <PageIntro eyebrow="Work with the council" title="Opportunities" description="Find procurement, employment, internship and graduate training opportunities." />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-5 md:grid-cols-3">
        <article v-for="item in opportunities" :key="item.title" class="flex min-h-72 flex-col bg-canvas p-7 sm:p-8">
          <component :is="item.icon" class="text-orange-600" :size="31" weight="regular" />
          <h2 class="mt-10 text-xl font-extrabold tracking-[-0.03em]">{{ item.title }}</h2>
          <p class="mt-3 flex-1 text-sm leading-6 text-ink/56">{{ item.description }}</p>
          <a class="text-link mt-7" href="#">View listings <PhArrowRight :size="16" weight="bold" /></a>
        </article>
      </div>
    </section>
  </div>
</template>

