<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhCheck, PhEnvelopeSimple, PhGavel, PhUsersThree } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'

const route = useRoute()
const department = computed(() => cmsContent.departments.find((item) => item.slug === route.params.slug) || cmsContent.departments[0])
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Municipal directorate"
      :title="department.name"
      :description="department.summary"
    >
      <template #breadcrumb>
        <RouterLink class="hover:text-orange-600" to="/directorates">Directorates</RouterLink>
        <span class="mx-2 text-ink/25">/</span>
        <span>{{ department.shortName }}</span>
      </template>
    </PageIntro>

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <aside>
          <div class="sticky top-6 bg-civic-900 p-7 text-white sm:p-8">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">Directorate contact</p>
            <p class="cms-safe-text mt-5 text-xl font-extrabold">{{ department.lead }}</p>
            <a class="cms-safe-text mt-4 flex items-center gap-2 text-sm text-white/68 hover:text-white" :href="`mailto:${department.contact}`">
              <PhEnvelopeSimple :size="18" /> {{ department.contact }}
            </a>
            <RouterLink class="mt-7 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-white" to="/contact">
              Contact the directorate <PhArrowRight :size="16" weight="bold" />
            </RouterLink>
          </div>
        </aside>

        <div class="grid gap-14">
          <section>
            <p class="section-kicker">Mandate</p>
            <h2 class="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-ink">What the directorate is responsible for</h2>
            <p class="cms-safe-text mt-5 text-base leading-8 text-ink/65">{{ department.mandate }}</p>
          </section>

          <details class="editorial-disclosure bg-orange-50 px-6 sm:px-8">
            <summary>Legal authority</summary>
            <div class="flex gap-4 pb-7">
              <PhGavel class="shrink-0 text-orange-700" :size="28" weight="regular" />
              <div>
                <p class="cms-safe-text mt-3 text-sm leading-6 text-ink/62">{{ department.authority }}</p>
              </div>
            </div>
          </details>

          <details class="editorial-disclosure">
            <summary><span class="flex items-center gap-3"><PhUsersThree class="text-civic-700" :size="27" /> Units and sections</span></summary>
            <div class="mt-7 grid gap-3 pb-7 sm:grid-cols-2">
              <div v-for="unit in department.units" :key="unit" class="cms-safe-text flex min-w-0 items-center gap-3 bg-canvas p-4 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_rgba(23,35,58,0.06)]">
                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage-100 text-civic-800"><PhCheck :size="14" weight="bold" /></span>
                {{ unit }}
              </div>
            </div>
          </details>

          <section>
            <h2 class="text-2xl font-extrabold tracking-[-0.035em]">Services offered</h2>
            <div class="mt-6 grid gap-0 sm:grid-cols-2 sm:gap-x-10">
              <div v-for="service in department.services" :key="service" class="cms-safe-text flex min-h-16 min-w-0 items-center gap-3 border-b border-ink/10 py-3 text-sm font-semibold text-ink/72">
                <PhArrowRight class="shrink-0 text-orange-600" :size="16" weight="bold" />
                {{ service }}
              </div>
            </div>
          </section>

          <section>
            <p class="section-kicker">People serving this directorate</p>
            <h2 class="mt-4 text-2xl font-extrabold tracking-[-0.035em]">Directorate team</h2>
            <div v-if="department.team?.length" class="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <article v-for="member in department.team" :key="`${member.name}-${member.role}`" class="group min-w-0 overflow-hidden bg-canvas">
                <div class="aspect-[4/5] overflow-hidden bg-sage-100">
                  <img class="h-full w-full object-cover transition duration-500 ease-premium group-hover:scale-[1.025]" :src="member.photo" :alt="`${member.name}, ${member.role}`" />
                </div>
                <div class="min-w-0 border-t-4 border-civic-700 p-5">
                  <p class="cms-safe-text text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-civic-700">{{ member.role }}</p>
                  <h3 class="cms-safe-text mt-2 text-lg font-extrabold leading-tight tracking-[-0.025em]">{{ member.name }}</h3>
                </div>
              </article>
            </div>
            <p v-else class="mt-6 bg-sage-50 p-5 text-sm leading-6 text-ink/60">Team information is being prepared by the directorate.</p>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
