<script setup>
import { PhArrowRight } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'

const questions = [
  { question: 'How do I find the municipal service I need?', answer: 'Use the service directory to search by service or responsible directorate.', link: 'Browse services', to: '/services' },
  { question: 'Where can I find directorate contacts and responsibilities?', answer: 'Each directorate page lists its mandate, units, services and official contact address.', link: 'View directorates', to: '/directorates' },
  { question: 'Where are tender notices published?', answer: 'Current procurement notices and supplier information are listed on the Tenders page.', link: 'View tenders', to: '/tenders' },
  { question: 'How can I apply for a council job or internship?', answer: 'Open vacancies and placement notices appear on the Careers page with their application requirements.', link: 'View careers', to: '/careers' },
  { question: 'Where can I access budgets, plans and policies?', answer: 'The Open Government page brings together available municipal publications and public documents.', link: 'Open document library', to: '/open-government' },
  { question: 'How do I report a problem or send feedback?', answer: 'Use the citizen feedback form or contact the council by telephone or email.', link: 'Send feedback', to: '/contact#feedback' },
]
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Help and guidance"
      title="Frequently asked questions"
      description="Quick answers and direct routes to commonly requested municipal information."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
        <div>
          <p class="section-kicker">Common questions</p>
          <h2 class="section-title mt-4">Start with the right public service</h2>
          <p class="section-description">If your question is not covered, the council help desk can direct it to the responsible office.</p>
          <RouterLink class="button-primary mt-7" to="/contact#feedback">Contact the help desk</RouterLink>
        </div>

        <div class="grid gap-0">
          <article v-for="(item, index) in questions" :key="item.question" class="grid gap-4 border-b border-civic-900/12 py-7 first:pt-0 sm:grid-cols-[3rem_1fr]">
            <span class="font-mono text-sm font-bold tabular-nums text-orange-700">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="text-xl font-extrabold leading-tight tracking-[-0.03em]">{{ item.question }}</h3>
              <p class="mt-3 text-sm leading-7 text-ink/62">{{ item.answer }}</p>
              <RouterLink class="text-link mt-4" :to="item.to">{{ item.link }} <PhArrowRight :size="16" weight="bold" /></RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
