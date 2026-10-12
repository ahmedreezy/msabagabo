<script setup>
import { computed } from 'vue'
import { PhArrowRight, PhArrowUpRight, PhCaretDown } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import FaqAnswer from '../components/FaqAnswer.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const categories = computed(() => cmsContent.faqs.reduce((groups, item) => {
  const category = item.category || 'General guidance'
  if (!groups[category]) groups[category] = []
  groups[category].push(item)
  return groups
}, {}))

const isExternal = (value = '') => /^https?:\/\//.test(value)
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Help and guidance"
      title="Frequently asked questions"
      description="Clear, reviewed answers to common questions about municipal services, payments and community programmes."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.48fr_1.52fr] lg:gap-20">
        <aside>
          <div class="sticky top-8">
            <p class="section-kicker">Official guidance</p>
            <h2 class="section-title mt-4">Start with the responsible office</h2>
            <p class="section-description">Service requirements and programme windows can change. Each answer shows its responsible department and review date.</p>
            <RouterLink class="button-primary mt-7" to="/contact">Contact the help desk</RouterLink>
          </div>
        </aside>

        <div class="grid gap-12">
          <section v-for="(items, category) in categories" :key="category" :aria-labelledby="`faq-${String(category).replace(/\W+/g, '-').toLowerCase()}`">
            <header class="mb-5 flex items-end justify-between gap-5 border-b border-civic-900/12 pb-4">
              <div>
                <p class="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-orange-700">Service area</p>
                <h2 :id="`faq-${String(category).replace(/\W+/g, '-').toLowerCase()}`" class="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-ink">{{ category }}</h2>
              </div>
              <div class="grid justify-items-end gap-2">
                <span class="text-xs font-bold tabular-nums text-ink/50">{{ items.length }} {{ items.length === 1 ? 'answer' : 'answers' }}</span>
                <RouterLink v-if="items[0]?.departmentSlug" class="text-xs font-extrabold text-civic-700 hover:text-orange-700" :to="`/directorates/${items[0].departmentSlug}`">View directorate</RouterLink>
              </div>
            </header>

            <div class="divide-y divide-civic-900/10">
              <details v-for="(item, index) in items" :key="item.slug || item.question" :open="index === 0" class="group py-1">
                <summary class="flex cursor-pointer list-none items-start gap-5 py-6">
                  <span class="mt-1 font-mono text-xs font-bold tabular-nums text-orange-700">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="flex-1 text-lg font-extrabold leading-snug tracking-[-0.025em] text-ink sm:text-xl">{{ item.question }}</span>
                  <PhCaretDown class="mt-1 shrink-0 text-civic-700 transition duration-300 group-open:rotate-180" :size="20" weight="bold" />
                </summary>
                <div class="pb-8 pl-0 sm:pl-[3.25rem]">
                  <FaqAnswer :blocks="item.answerBlocks" :fallback="item.answer" />
                  <footer class="mt-6 flex flex-wrap items-center justify-between gap-4 border-l-2 border-civic-700/30 bg-canvas px-4 py-3 text-xs text-ink/58">
                    <span><strong class="text-ink/75">Responsible:</strong> {{ item.responsibleOffice || item.department || category }}</span>
                    <span v-if="item.lastReviewed">Reviewed {{ formatCmsDate(item.lastReviewed) }}</span>
                  </footer>
                  <a v-if="item.relatedTo && isExternal(item.relatedTo)" class="text-link mt-5" :href="item.relatedTo" target="_blank" rel="noreferrer">
                    {{ item.relatedLabel || 'Official guidance' }} <PhArrowUpRight :size="16" weight="bold" />
                  </a>
                  <RouterLink v-else-if="item.relatedTo" class="text-link mt-5" :to="item.relatedTo">
                    {{ item.relatedLabel || 'Related service' }} <PhArrowRight :size="16" weight="bold" />
                  </RouterLink>
                </div>
              </details>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
