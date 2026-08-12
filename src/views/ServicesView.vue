<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhArrowRight,
  PhBuildings,
  PhCaretDown,
  PhCheckCircle,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { departments } from '../data/siteData'

const route = useRoute()
const search = ref(route.query.q || '')
const expandedDepartments = ref([departments[0]?.slug].filter(Boolean))

const filteredDepartments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return departments.reduce((matches, department) => {
    const departmentText = `${department.name} ${department.shortName} ${department.summary} ${department.mandate}`.toLowerCase()
    const departmentMatches = departmentText.includes(query)
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

const isExpanded = (slug) => expandedDepartments.value.includes(slug)

const toggleDepartment = (slug) => {
  expandedDepartments.value = isExpanded(slug)
    ? expandedDepartments.value.filter((item) => item !== slug)
    : [...expandedDepartments.value, slug]
}
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Public services"
      title="Services by department"
      description="Choose the responsible municipal department to view its services and mandate."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container">
        <div class="flex flex-col gap-6 border-b border-ink/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-civic-700">Department directory</p>
            <h2 class="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-ink sm:text-3xl">
              {{ departments.length }} service departments
            </h2>
          </div>

          <div class="w-full lg:max-w-md">
            <label class="sr-only" for="service-search">Search departments or services</label>
            <div class="relative">
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
                placeholder="Search departments or services"
              />
            </div>
          </div>
        </div>

        <div v-if="filteredDepartments.length" class="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          <article v-for="(department, index) in filteredDepartments" :key="department.slug">
            <h3>
              <button
                class="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-6 text-left sm:gap-6 sm:py-7"
                type="button"
                :aria-expanded="isExpanded(department.slug)"
                :aria-controls="`services-${department.slug}`"
                @click="toggleDepartment(department.slug)"
              >
                <span class="flex size-11 shrink-0 items-center justify-center bg-sage-50 text-civic-800 transition-colors group-hover:bg-civic-700 group-hover:text-white sm:size-12">
                  <PhBuildings :size="22" weight="duotone" />
                </span>

                <span class="min-w-0">
                  <span class="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/42">
                    Department {{ String(index + 1).padStart(2, '0') }} · {{ department.services.length }} services
                  </span>
                  <span class="mt-1 block text-lg font-extrabold tracking-[-0.015em] text-ink sm:text-xl">
                    {{ department.name }}
                  </span>
                  <span class="mt-1 hidden max-w-3xl text-sm font-medium leading-6 text-ink/55 md:block">
                    {{ department.summary }}
                  </span>
                </span>

                <span class="flex size-9 items-center justify-center rounded-full border border-ink/12 text-ink/55 transition duration-300 group-hover:border-civic-700 group-hover:text-civic-700">
                  <PhCaretDown
                    class="transition-transform duration-300"
                    :class="isExpanded(department.slug) ? 'rotate-180' : ''"
                    :size="17"
                    weight="bold"
                  />
                </span>
              </button>
            </h3>

            <div
              v-show="isExpanded(department.slug)"
              :id="`services-${department.slug}`"
              class="pb-8 pl-0 sm:pl-18 lg:pb-10"
            >
              <div class="grid gap-8 bg-canvas p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] lg:gap-12">
                <div>
                  <p class="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-civic-700">Services offered</p>
                  <ul class="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <li
                      v-for="service in department.visibleServices"
                      :key="service"
                      class="flex items-start gap-3 text-sm font-semibold leading-6 text-ink/75"
                    >
                      <PhCheckCircle class="mt-0.5 shrink-0 text-civic-700" :size="18" weight="fill" />
                      <span>{{ service }}</span>
                    </li>
                  </ul>
                </div>

                <div class="border-t border-ink/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <p class="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-ink/45">Department mandate</p>
                  <p class="mt-3 text-sm font-medium leading-6 text-ink/64">{{ department.mandate }}</p>
                  <RouterLink class="text-link mt-6" :to="`/departments/${department.slug}`">
                    View mandate, units & team
                    <PhArrowRight :size="16" weight="bold" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </article>
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
