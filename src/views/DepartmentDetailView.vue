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
      eyebrow="Municipal department"
      :title="department.name"
      :description="department.summary"
    >
      <template #breadcrumb>
        <RouterLink class="hover:text-orange-600" to="/departments">Departments</RouterLink>
        <span class="mx-2 text-ink/25">/</span>
        <span>{{ department.shortName }}</span>
      </template>
    </PageIntro>

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <aside>
          <div class="sticky top-6 bg-civic-900 p-7 text-white sm:p-8">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">Department contact</p>
            <p class="mt-5 text-xl font-extrabold">{{ department.lead }}</p>
            <a class="mt-4 flex items-center gap-2 text-sm text-white/68 hover:text-white" :href="`mailto:${department.contact}`">
              <PhEnvelopeSimple :size="18" /> {{ department.contact }}
            </a>
            <RouterLink class="mt-7 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-white" to="/contact">
              Contact the department <PhArrowRight :size="16" weight="bold" />
            </RouterLink>
          </div>
        </aside>

        <div class="grid gap-14">
          <section>
            <p class="section-kicker">Mandate</p>
            <h2 class="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-ink">What the department is responsible for</h2>
            <p class="mt-5 text-base leading-8 text-ink/65">{{ department.mandate }}</p>
          </section>

          <section class="bg-orange-50 p-6 sm:p-8">
            <div class="flex gap-4">
              <PhGavel class="shrink-0 text-orange-700" :size="28" weight="regular" />
              <div>
                <h2 class="text-xl font-extrabold tracking-[-0.025em]">Legal authority</h2>
                <p class="mt-3 text-sm leading-6 text-ink/62">{{ department.authority }}</p>
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3">
              <PhUsersThree class="text-civic-700" :size="27" />
              <h2 class="text-2xl font-extrabold tracking-[-0.035em]">Units and sub-departments</h2>
            </div>
            <div class="mt-7 grid gap-3 sm:grid-cols-2">
              <div v-for="unit in department.units" :key="unit" class="flex items-center gap-3 bg-canvas p-4 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_rgba(17,26,23,0.06)]">
                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage-100 text-civic-800"><PhCheck :size="14" weight="bold" /></span>
                {{ unit }}
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-extrabold tracking-[-0.035em]">Services offered</h2>
            <div class="mt-6 grid gap-0 sm:grid-cols-2 sm:gap-x-10">
              <div v-for="service in department.services" :key="service" class="flex min-h-16 items-center gap-3 border-b border-ink/10 py-3 text-sm font-semibold text-ink/72">
                <PhArrowRight class="shrink-0 text-orange-600" :size="16" weight="bold" />
                {{ service }}
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-extrabold tracking-[-0.035em]">Department team</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="bg-sage-50 p-6">
                <p class="text-xs font-bold uppercase tracking-[0.13em] text-civic-700">Department lead</p>
                <p class="mt-3 text-lg font-extrabold">{{ department.lead }}</p>
              </div>
              <div class="bg-canvas p-6">
                <p class="text-xs font-bold uppercase tracking-[0.13em] text-civic-700">Team listing</p>
                <p class="mt-3 text-sm leading-6 text-ink/58">Staff profiles and official contacts will be maintained through the content management system.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
