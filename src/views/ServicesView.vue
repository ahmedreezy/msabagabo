<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhCheck, PhMagnifyingGlass } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { departments } from '../data/siteData'

const route = useRoute()
const search = ref(route.query.q || '')

const totalServices = computed(() =>
  departments.reduce((total, department) => total + department.services.length, 0),
)

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
        <div class="grid overflow-hidden bg-white shadow-[0_20px_70px_rgba(7,59,44,0.07)] md:grid-cols-[auto_auto_1fr]">
          <div class="flex items-center gap-3 border-b border-ink/8 px-5 py-5 md:border-b-0 md:border-r md:px-7">
            <strong class="text-2xl font-extrabold tracking-[-0.04em] text-civic-800">{{ departments.length }}</strong>
            <span class="text-xs font-bold leading-4 text-ink/48">Municipal<br />departments</span>
          </div>
          <div class="flex items-center gap-3 border-b border-ink/8 px-5 py-5 md:border-b-0 md:border-r md:px-7">
            <strong class="text-2xl font-extrabold tracking-[-0.04em] text-civic-800">{{ totalServices }}</strong>
            <span class="text-xs font-bold leading-4 text-ink/48">Listed<br />services</span>
          </div>
          <div class="relative min-h-16">
            <label class="sr-only" for="service-search">Search departments or services</label>
            <PhMagnifyingGlass
              class="absolute left-5 top-1/2 -translate-y-1/2 text-civic-700 md:left-7"
              :size="21"
              weight="bold"
            />
            <input
              id="service-search"
              v-model="search"
              class="h-full min-h-16 w-full border-0 bg-white py-5 pl-13 pr-5 text-sm font-semibold text-ink outline-none transition placeholder:text-ink/38 focus:bg-sage-50 md:pl-16"
              type="search"
              placeholder="Search a department or service"
            />
          </div>
        </div>

        <div v-if="filteredDepartments.length" class="mt-10 bg-white px-5 sm:px-8 lg:px-12">
          <article
            v-for="(department, index) in filteredDepartments"
            :key="department.slug"
            class="grid gap-8 border-b border-ink/10 py-10 last:border-b-0 sm:py-12 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16 lg:py-14"
          >
            <div class="relative lg:pl-14">
              <span class="mb-5 block font-mono text-xs font-bold tabular-nums text-civic-700 lg:absolute lg:left-0 lg:top-1">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <h2 class="max-w-md text-2xl font-extrabold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[1.75rem]">
                {{ department.name }}
              </h2>
              <p class="mt-4 max-w-md text-sm leading-6 text-ink/58">{{ department.summary }}</p>

              <div class="mt-7 border-l-2 border-civic-700/25 pl-4">
                <p class="text-xs font-bold text-ink/45">Mandate</p>
                <p class="mt-2 max-w-md text-xs leading-5 text-ink/52">{{ department.mandate }}</p>
              </div>
            </div>

            <div class="lg:border-l lg:border-ink/10 lg:pl-12">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-sm font-extrabold text-ink">Services offered</h3>
                <span class="text-xs font-bold tabular-nums text-ink/40">
                  {{ department.visibleServices.length }} {{ department.visibleServices.length === 1 ? 'service' : 'services' }}
                </span>
              </div>

              <ul class="mt-5 grid gap-x-9 gap-y-3 sm:grid-cols-2">
                <li
                  v-for="service in department.visibleServices"
                  :key="service"
                  class="flex min-h-12 items-start gap-3 bg-canvas px-4 py-3 text-sm font-semibold leading-6 text-ink/70"
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
