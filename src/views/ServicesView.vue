<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhArrowRight,
  PhBuildings,
  PhCheck,
  PhListChecks,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'

const route = useRoute()
const search = ref(route.query.q || '')
const departments = computed(() => cmsContent.departments)

const totalServices = computed(() =>
  departments.value.reduce((total, department) => total + department.services.length, 0),
)

const filteredDepartments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return departments.value.reduce((matches, department) => {
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
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Public services"
      title="Services by department"
      description="Find the municipal department responsible for the service you need."
    />

    <section class="bg-canvas pb-24 pt-10 sm:pb-28 sm:pt-14 lg:pt-16">
      <div class="site-container">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-[0.7fr_0.7fr_1.6fr] lg:gap-4">
          <div class="flex min-h-32 flex-col justify-between bg-white p-5 shadow-[0_14px_45px_rgba(7,59,44,0.055)] sm:p-6">
            <div class="flex items-center gap-3">
              <span class="flex size-9 shrink-0 items-center justify-center bg-sage-50 text-civic-700">
                <PhBuildings :size="19" weight="duotone" />
              </span>
              <span class="text-xs font-extrabold leading-4 text-ink/70">Municipal departments</span>
            </div>
            <strong class="mt-5 block text-4xl font-extrabold leading-none tracking-[-0.055em] text-civic-800">{{ departments.length }}</strong>
          </div>

          <div class="flex min-h-32 flex-col justify-between bg-white p-5 shadow-[0_14px_45px_rgba(7,59,44,0.055)] sm:p-6">
            <div class="flex items-center gap-3">
              <span class="flex size-9 shrink-0 items-center justify-center bg-sage-50 text-civic-700">
                <PhListChecks :size="19" weight="duotone" />
              </span>
              <span class="text-xs font-extrabold leading-4 text-ink/70">Listed services</span>
            </div>
            <strong class="mt-5 block text-4xl font-extrabold leading-none tracking-[-0.055em] text-civic-800">{{ totalServices }}</strong>
          </div>

          <div class="col-span-2 flex min-h-32 flex-col justify-between bg-white p-5 shadow-[0_14px_45px_rgba(7,59,44,0.055)] sm:p-6 lg:col-span-1">
            <label class="flex items-center gap-3 text-xs font-extrabold leading-4 text-ink/70" for="service-search">
              <span class="flex size-9 shrink-0 items-center justify-center bg-sage-50 text-civic-700">
                <PhMagnifyingGlass :size="19" weight="duotone" />
              </span>
              Search the service directory
            </label>
            <div class="relative">
              <PhMagnifyingGlass
                class="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50"
                :size="18"
                weight="bold"
              />
              <input
                id="service-search"
                v-model="search"
                class="min-h-12 w-full border-0 bg-canvas py-3 pl-12 pr-4 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(17,26,23,0.08)] outline-none transition placeholder:text-ink/50 focus:bg-sage-50 focus:shadow-[inset_0_0_0_2px_rgba(23,99,76,0.7)]"
                type="search"
                placeholder="Enter a department or service"
              />
            </div>
          </div>
        </div>

        <div v-if="filteredDepartments.length" class="mt-12 space-y-5 sm:mt-14 sm:space-y-6">
          <article
            v-for="(department, index) in filteredDepartments"
            :key="department.slug"
            class="grid gap-9 bg-white px-5 py-10 shadow-[0_14px_48px_rgba(7,59,44,0.045)] sm:px-8 sm:py-12 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16 lg:px-12 lg:py-14"
          >
            <div>
              <div class="flex items-baseline gap-4">
                <span class="shrink-0 font-mono text-xs font-bold tabular-nums text-civic-700">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <h2 class="max-w-md text-2xl font-extrabold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[1.75rem]">
                  {{ department.name }}
                </h2>
              </div>
              <p class="mt-5 max-w-md text-sm font-medium leading-7 text-ink/72">{{ department.summary }}</p>

              <div class="mt-8 border-l-2 border-civic-700/35 pl-4">
                <p class="text-xs font-extrabold text-ink/65">Mandate</p>
                <p class="mt-2 max-w-md text-xs font-medium leading-5 text-ink/66">{{ department.mandate }}</p>
              </div>
            </div>

            <div class="lg:border-l lg:border-ink/10 lg:pl-12">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-sm font-extrabold text-ink">Services offered</h3>
                <span class="text-xs font-bold tabular-nums text-ink/60">
                  {{ department.visibleServices.length }} {{ department.visibleServices.length === 1 ? 'service' : 'services' }}
                </span>
              </div>

              <ul class="mt-5 grid gap-x-9 gap-y-3 sm:grid-cols-2">
                <li
                  v-for="service in department.visibleServices"
                  :key="service"
                  class="flex min-h-12 items-start gap-3 bg-canvas px-4 py-3 text-sm font-semibold leading-6 text-ink/78"
                >
                  <PhCheck class="mt-1 shrink-0 text-civic-700" :size="15" weight="bold" />
                  <span>{{ service }}</span>
                </li>
              </ul>

              <RouterLink
                class="mt-7 inline-flex min-h-11 items-center gap-3 border-b-2 border-civic-700 pb-1 text-sm font-extrabold text-civic-800 transition duration-300 hover:gap-4 hover:text-civic-700 active:translate-y-px"
                :to="`/departments/${department.slug}`"
              >
                View department details
                <PhArrowRight :size="16" weight="bold" />
              </RouterLink>
            </div>
          </article>
        </div>

        <div v-else class="mt-10 max-w-xl bg-white p-7 shadow-[0_20px_70px_rgba(7,59,44,0.07)]">
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
