<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhArrowRight,
  PhBuildings,
  PhCheck,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { departments } from '../data/siteData'

const route = useRoute()
const search = ref(route.query.q || '')
const selectedSlug = ref(departments[0]?.slug || '')

const filteredDepartments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return departments.reduce((matches, department) => {
    const departmentMatches = `${department.name} ${department.summary} ${department.mandate}`
      .toLowerCase()
      .includes(query)
    const matchingServices = query
      ? department.services.filter((service) => service.toLowerCase().includes(query))
      : department.services

    if (!query || departmentMatches || matchingServices.length) {
      matches.push({
        ...department,
        visibleServices: departmentMatches ? department.services : matchingServices,
      })
    }

    return matches
  }, [])
})

const activeDepartment = computed(() =>
  filteredDepartments.value.find((department) => department.slug === selectedSlug.value)
  || filteredDepartments.value[0]
  || null,
)

const selectDepartment = (slug) => {
  selectedSlug.value = slug
}
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Public services"
      title="Services by department"
      description="Find the municipal office responsible for the service you need."
    />

    <section class="bg-white pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pt-20">
      <div class="site-container">
        <div class="grid gap-6 border-b border-ink/10 pb-8 lg:grid-cols-[1fr_minmax(22rem,0.7fr)] lg:items-end">
          <div>
            <p class="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-civic-700">Municipal service directory</p>
            <h2 class="mt-3 max-w-2xl text-2xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-3xl">
              Start with the responsible department
            </h2>
          </div>

          <div class="relative">
            <label class="sr-only" for="service-search">Search departments or services</label>
            <PhMagnifyingGlass
              class="absolute left-5 top-1/2 -translate-y-1/2 text-civic-700"
              :size="20"
              weight="bold"
            />
            <input
              id="service-search"
              v-model="search"
              class="w-full bg-canvas py-4 pl-13 pr-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(17,26,23,0.08)] outline-none transition focus:shadow-[inset_0_0_0_2px_rgba(25,101,73,0.7)] placeholder:text-ink/38"
              type="search"
              placeholder="Search a department or service"
            />
          </div>
        </div>

        <div v-if="activeDepartment" class="mt-8">
          <div class="mb-5 lg:hidden">
            <label class="mb-2 block text-xs font-bold text-ink/60" for="department-select">Select department</label>
            <select
              id="department-select"
              class="w-full border-0 bg-canvas px-4 py-4 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_rgba(17,26,23,0.1)] outline-none focus:shadow-[inset_0_0_0_2px_rgba(25,101,73,0.7)]"
              :value="activeDepartment.slug"
              @change="selectDepartment($event.target.value)"
            >
              <option v-for="department in filteredDepartments" :key="department.slug" :value="department.slug">
                {{ department.name }} ({{ department.services.length }})
              </option>
            </select>
          </div>

          <div class="grid items-start lg:grid-cols-[minmax(17rem,0.34fr)_minmax(0,1fr)]">
            <aside class="hidden bg-canvas p-3 lg:block" aria-label="Service departments">
              <p class="px-4 pb-4 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink/42">
                {{ filteredDepartments.length }} departments
              </p>
              <button
                v-for="(department, index) in filteredDepartments"
                :key="department.slug"
                class="group grid w-full grid-cols-[2rem_1fr_auto] items-center gap-2 border-t border-ink/8 px-4 py-4 text-left transition duration-300 hover:bg-white"
                :class="activeDepartment.slug === department.slug ? 'bg-civic-800 text-white hover:bg-civic-800' : 'text-ink'"
                type="button"
                @click="selectDepartment(department.slug)"
              >
                <span
                  class="font-mono text-[0.65rem] font-bold tabular-nums"
                  :class="activeDepartment.slug === department.slug ? 'text-white/48' : 'text-ink/35'"
                >
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <span class="text-sm font-bold leading-5">{{ department.name }}</span>
                <PhArrowRight
                  class="transition-transform duration-300 group-hover:translate-x-0.5"
                  :class="activeDepartment.slug === department.slug ? 'text-orange-300' : 'text-ink/28'"
                  :size="15"
                  weight="bold"
                />
              </button>
            </aside>

            <article class="relative overflow-hidden bg-civic-50 px-6 py-8 sm:px-9 sm:py-10 lg:min-h-[38rem] lg:px-12 lg:py-12 xl:px-16">
              <div class="absolute right-0 top-0 size-36 translate-x-1/3 -translate-y-1/3 rounded-full border-[2rem] border-civic-700/[0.04]" aria-hidden="true"></div>

              <div class="relative">
                <div class="flex items-start justify-between gap-6">
                  <div class="max-w-3xl">
                    <p class="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-civic-700">
                      {{ activeDepartment.services.length }} services offered
                    </p>
                    <h3 class="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink">
                      {{ activeDepartment.name }}
                    </h3>
                    <p class="mt-5 max-w-2xl text-sm font-medium leading-7 text-ink/62 sm:text-base">
                      {{ activeDepartment.summary }}
                    </p>
                  </div>
                  <span class="hidden size-14 shrink-0 items-center justify-center bg-white text-civic-800 shadow-[0_12px_35px_rgba(7,59,44,0.08)] sm:flex">
                    <PhBuildings :size="27" weight="duotone" />
                  </span>
                </div>

                <div class="mt-9 border-t border-civic-900/10 pt-8 sm:mt-10">
                  <h4 class="text-sm font-extrabold text-ink">Services handled by this department</h4>
                  <ul class="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                    <li
                      v-for="service in activeDepartment.visibleServices"
                      :key="service"
                      class="flex min-h-11 items-start gap-3 border-b border-civic-900/8 pb-3 text-sm font-semibold leading-6 text-ink/72"
                    >
                      <span class="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-civic-700 text-white">
                        <PhCheck :size="10" weight="bold" />
                      </span>
                      <span>{{ service }}</span>
                    </li>
                  </ul>
                </div>

                <div class="mt-9 grid gap-6 border-t border-civic-900/10 pt-7 sm:mt-10 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div class="max-w-2xl">
                    <p class="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink/42">Department mandate</p>
                    <p class="mt-2 text-sm leading-6 text-ink/60">{{ activeDepartment.mandate }}</p>
                  </div>
                  <RouterLink
                    class="inline-flex min-h-12 items-center justify-center gap-3 bg-civic-800 px-5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-civic-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-700"
                    :to="`/departments/${activeDepartment.slug}`"
                  >
                    Department details
                    <PhArrowRight :size="16" weight="bold" />
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-else class="mt-10 max-w-xl bg-orange-50 p-7">
          <h2 class="font-extrabold">No matching department or service</h2>
          <p class="mt-2 text-sm leading-6 text-ink/58">Try a shorter search term or contact the council for guidance.</p>
          <RouterLink class="text-link mt-5" to="/contact">
            Contact the council
            <PhArrowRight :size="16" weight="bold" />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
