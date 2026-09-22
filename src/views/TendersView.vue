<script setup>
import { computed } from 'vue'
import { PhArrowRight, PhFileText } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const tenders = computed(() => cmsContent.updates.filter((update) =>
  /procurement|tender|bid/i.test(`${update.type} ${update.title} ${update.excerpt}`),
))
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Procurement notices"
      title="Tenders"
      description="View current municipal procurement notices, bidding opportunities and supplier information."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
        <div>
          <p class="section-kicker">Work with the council</p>
          <h2 class="section-title mt-4">Open procurement notices</h2>
          <p class="section-description">Always confirm submission requirements and deadlines in the official notice before preparing a bid.</p>
        </div>

        <div v-if="tenders.length" class="grid gap-4">
          <article v-for="tender in tenders" :key="tender.title" class="bg-canvas p-6 sm:p-8">
            <div class="flex items-start gap-4">
              <span class="grid h-12 w-12 shrink-0 place-items-center bg-sage-100 text-civic-800"><PhFileText :size="23" /></span>
              <div class="min-w-0">
                <p class="content-meta">{{ tender.type }} <span>/</span> {{ formatCmsDate(tender.date) }}</p>
                <h3 class="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]">{{ tender.title }}</h3>
                <p class="mt-3 text-sm leading-7 text-ink/62">{{ tender.excerpt }}</p>
                <RouterLink class="text-link mt-5" to="/contact#e8ebf0ck">Request tender information <PhArrowRight :size="16" weight="bold" /></RouterLink>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="bg-sage-50 p-8 sm:p-10" role="status">
          <PhFileText class="text-civic-700" :size="32" />
          <h2 class="mt-5 text-2xl font-extrabold tracking-[-0.035em]">No active tenders are currently published</h2>
          <p class="mt-3 max-w-xl text-sm leading-7 text-ink/62">New procurement notices will appear here when they are released by the Municipal Council.</p>
          <RouterLink class="text-link mt-6" to="/contact#e8ebf0ck">Contact the procurement desk <PhArrowRight :size="16" weight="bold" /></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
