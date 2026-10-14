<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowLeft, PhBuildings, PhCalendarBlank, PhCheck, PhCurrencyCircleDollar, PhMapPin, PhShieldCheck } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import NotFoundView from './NotFoundView.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const route = useRoute()
const project = computed(() => cmsContent.projects.find((item) => item.slug === route.params.slug))
const formatUgx = (value) => Number.isFinite(Number(value)) ? `UGX ${new Intl.NumberFormat('en-UG').format(Number(value))}` : value
</script>

<template>
  <div v-if="project">
    <PageIntro eyebrow="Municipal programme" :title="project.title" :description="project.summary">
      <template #breadcrumb>
        <RouterLink class="hover:text-orange-600" to="/projects">Projects</RouterLink>
        <span class="mx-2 text-ink/25">/</span><span>{{ project.status }}</span>
      </template>
    </PageIntro>

    <section class="bg-white py-16 sm:py-20">
      <div class="site-container grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
        <aside>
          <div class="sticky top-8 bg-civic-900 p-7 text-white sm:p-8">
            <p class="text-xs font-extrabold uppercase tracking-[0.13em] text-orange-300">Programme record</p>
            <dl class="mt-7 grid gap-6 text-sm">
              <div><dt class="flex items-center gap-2 text-white/55"><PhCalendarBlank :size="17" /> Programme period</dt><dd class="mt-2 font-extrabold">{{ project.period }}</dd></div>
              <div><dt class="flex items-center gap-2 text-white/55"><PhBuildings :size="17" /> Implementing authority</dt><dd class="mt-2 leading-6">{{ project.implementingAuthority }}</dd></div>
              <div><dt class="flex items-center gap-2 text-white/55"><PhShieldCheck :size="17" /> Status</dt><dd class="mt-2 font-extrabold text-orange-200">{{ project.status }}</dd></div>
            </dl>
            <RouterLink class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-orange-300" to="/projects"><PhArrowLeft :size="16" /> All projects</RouterLink>
          </div>
        </aside>

        <div class="grid gap-16">
          <section>
            <p class="section-kicker">Programme framework</p>
            <h2 class="mt-4 text-3xl font-extrabold tracking-[-0.04em]">What the programme is designed to deliver</h2>
            <p v-if="project.strategyContext" class="mt-5 border-l-2 border-orange-600 bg-orange-50 p-5 text-sm leading-7 text-ink/70">{{ project.strategyContext }}</p>
            <ul class="mt-7 grid gap-3">
              <li v-for="pillar in project.pillars" :key="pillar" class="flex gap-3 bg-canvas p-5 text-sm font-semibold leading-6 text-ink/75"><PhCheck class="mt-1 shrink-0 text-civic-700" :size="16" weight="bold" />{{ pillar }}</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-extrabold tracking-[-0.035em]">Funding and participating entities</h2>
            <div class="mt-6 grid gap-5 md:grid-cols-2">
              <article class="bg-sage-50 p-6"><h3 class="font-extrabold">Funding partners</h3><ul class="mt-4 grid gap-3 text-sm leading-6 text-ink/68"><li v-for="item in project.fundingPartners" :key="item">{{ item }}</li></ul></article>
              <article class="bg-canvas p-6"><h3 class="font-extrabold">Participating entities</h3><ul class="mt-4 grid gap-2 text-sm leading-6 text-ink/68"><li v-for="item in project.participatingEntities" :key="item">{{ item }}</li></ul></article>
            </div>
            <div class="mt-5 grid gap-3"><article v-for="item in project.fundingComponents" :key="item" class="border-l-2 border-orange-600 bg-orange-50 p-5 text-sm leading-7 text-ink/70">{{ item }}</article></div>
          </section>

          <section>
            <p class="section-kicker">Road and drainage works</p>
            <h2 class="mt-4 text-2xl font-extrabold tracking-[-0.035em]">Contract packages</h2>
            <div class="mt-7 grid gap-5">
              <article v-for="entry in project.contractPackages" :key="entry.id" class="border border-civic-900/10 bg-white p-6 shadow-[0_16px_50px_rgba(7,59,44,0.06)]">
                <header class="flex flex-wrap items-center justify-between gap-3"><h3 class="text-lg font-extrabold">{{ entry.name }}</h3><span class="bg-sage-100 px-3 py-1 text-xs font-bold text-civic-800">{{ entry.contractor }}</span></header>
                <ul class="mt-4 grid gap-2 text-sm leading-6 text-ink/68"><li v-for="work in entry.works" :key="`${entry.id}-${work.name}`" class="flex gap-2"><PhMapPin class="mt-1 shrink-0" :size="16" /><span>{{ work.name }}<span v-if="work.length"> · {{ work.length }}</span></span></li></ul>
                <dl class="mt-5 grid gap-4 border-t border-civic-900/10 pt-5 text-xs sm:grid-cols-3">
                  <div><dt class="font-bold text-ink/48">Start</dt><dd class="mt-1 text-ink/75">{{ entry.start }}</dd></div>
                  <div><dt class="font-bold text-ink/48">Planned completion</dt><dd class="mt-1 text-ink/75">{{ entry.plannedCompletion }}</dd></div>
                  <div><dt class="flex items-center gap-1 font-bold text-ink/48"><PhCurrencyCircleDollar :size="14" /> Contract sum</dt><dd class="mt-1 text-ink/75">{{ formatUgx(entry.contractSumUgx) }}</dd></div>
                </dl>
              </article>
            </div>
          </section>

          <section>
            <p class="section-kicker">Implementation report</p>
            <h2 class="mt-4 text-2xl font-extrabold tracking-[-0.035em]">{{ project.implementationPeriod }}</h2>
            <div class="mt-7 overflow-x-auto border border-civic-900/10">
              <table class="w-full min-w-[46rem] border-collapse text-left text-sm leading-6">
                <thead class="bg-civic-900 text-white"><tr><th class="w-[22%] p-4">Activity</th><th class="w-[39%] p-4">Planned</th><th class="w-[39%] p-4">Implemented</th></tr></thead>
                <tbody class="divide-y divide-civic-900/10">
                  <tr v-for="entry in project.implementationUpdates" :key="entry.id" class="align-top">
                    <th scope="row" class="p-4 font-extrabold text-civic-800">{{ entry.topic }}</th>
                    <td class="p-4 text-ink/68">{{ entry.planned || 'Not stated in the submitted report.' }}</td>
                    <td class="p-4 text-ink/68">{{ entry.implemented || 'Not stated in the submitted report.' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer class="flex flex-wrap justify-between gap-4 bg-canvas p-5 text-xs leading-5 text-ink/58">
            <span><strong class="text-ink/75">Source:</strong> {{ project.sourceTitle }}</span>
            <span v-if="project.lastReviewed">Reviewed {{ formatCmsDate(project.lastReviewed) }}</span>
          </footer>
        </div>
      </div>
    </section>
  </div>
  <div v-else-if="!cmsContent.loaded" class="site-container py-20" role="status">Loading project…</div>
  <NotFoundView v-else />
</template>
