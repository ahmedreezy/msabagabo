<script setup>
import { PhCaretDown } from '@phosphor-icons/vue'
import FaqAnswer from './FaqAnswer.vue'
import { formatCmsDate } from '../stores/cmsContent'

defineProps({
  faqs: { type: Array, default: () => [] },
  sectionId: { type: String, default: '' },
  headingId: { type: String, default: 'directorate-faqs-heading' },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <section v-if="faqs.length" :id="sectionId || undefined" :aria-labelledby="headingId" :class="variant === 'education' ? 'education-section' : ''" tabindex="-1">
    <p :class="variant === 'education' ? 'education-eyebrow' : 'section-kicker'">Public guidance</p>
    <h2 :id="headingId" :class="variant === 'education' ? '' : 'mt-4 text-2xl font-extrabold tracking-[-0.035em]'">Frequently asked questions</h2>
    <div class="mt-7 divide-y divide-civic-900/10 border-y border-civic-900/10">
      <details v-for="item in faqs" :key="item.slug" class="group py-1">
        <summary class="flex cursor-pointer list-none items-start gap-4 py-5 text-base font-extrabold leading-6 text-ink">
          <span class="flex-1">{{ item.question }}</span>
          <PhCaretDown class="mt-1 shrink-0 transition group-open:rotate-180" :size="18" weight="bold" />
        </summary>
        <div class="pb-6">
          <FaqAnswer :blocks="item.answerBlocks" :fallback="item.answer" />
          <p v-if="item.lastReviewed" class="mt-4 text-xs font-semibold text-ink/48">Source: {{ item.sourceTitle }}<span v-if="item.sourceSection"> · {{ item.sourceSection }}</span> · Reviewed {{ formatCmsDate(item.lastReviewed) }}</p>
        </div>
      </details>
    </div>
  </section>
</template>
