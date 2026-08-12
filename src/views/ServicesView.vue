<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhMagnifyingGlass } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { departments } from '../data/siteData'

const route = useRoute()
const search = ref(route.query.q || '')

const services = departments.flatMap((department) =>
  department.services.map((title) => ({ title, department: department.shortName, slug: department.slug })),
)

const filteredServices = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return services
  return services.filter((service) => `${service.title} ${service.department}`.toLowerCase().includes(query))
})
</script>

<template>
  <div>
    <PageIntro eyebrow="Public services" title="Find a municipal service" description="Search by service or browse the department responsible for helping you." />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container">
        <label class="sr-only" for="service-search">Search services</label>
        <div class="relative max-w-2xl">
          <PhMagnifyingGlass class="absolute left-5 top-1/2 -translate-y-1/2 text-civic-700" :size="21" weight="bold" />
          <input id="service-search" v-model="search" class="w-full bg-canvas py-4 pl-13 pr-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(17,26,23,0.08)] outline-none placeholder:text-ink/38" type="search" placeholder="Search services" />
        </div>

        <div v-if="filteredServices.length" class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink v-for="service in filteredServices" :key="`${service.slug}-${service.title}`" class="group flex min-h-32 flex-col justify-between bg-canvas p-5 transition duration-500 ease-premium hover:-translate-y-0.5 hover:bg-sage-50" :to="`/departments/${service.slug}`">
            <div>
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-civic-700">{{ service.department }}</p>
              <h2 class="mt-3 text-base font-extrabold leading-snug text-ink">{{ service.title }}</h2>
            </div>
            <PhArrowRight class="mt-5 text-ink/30 transition-transform duration-500 ease-premium group-hover:translate-x-1 group-hover:text-orange-600" :size="17" weight="bold" />
          </RouterLink>
        </div>
        <div v-else class="mt-10 max-w-xl bg-orange-50 p-7">
          <h2 class="font-extrabold">No matching service found</h2>
          <p class="mt-2 text-sm leading-6 text-ink/58">Try a shorter search term or contact the council for guidance.</p>
          <RouterLink class="text-link mt-5" to="/contact">Contact the council <PhArrowRight :size="16" weight="bold" /></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

