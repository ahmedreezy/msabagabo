<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageIntro from '../components/PageIntro.vue'

const route = useRoute()

const content = {
  privacy: {
    description: 'How this municipal website handles information submitted by members of the public.',
    sections: [
      ['Information we receive', 'We only collect information that you choose to submit through municipal contact and feedback forms.'],
      ['How information is used', 'Submitted information is used to respond to enquiries, process feedback and improve municipal service delivery.'],
      ['Protection and disclosure', 'Information is handled in accordance with applicable Government of Uganda data protection and access-to-information requirements.'],
    ],
  },
  accessibility: {
    description: 'Our commitment to providing equal access to municipal information and services.',
    sections: [
      ['Our approach', 'The website is designed for keyboard navigation, readable contrast, responsive screens and assistive technologies.'],
      ['Motion and media', 'Slideshow motion can be paused and respects reduced-motion preferences configured on your device.'],
      ['Report an accessibility issue', 'If you cannot access information or complete a task, contact the council and describe the page and assistance required.'],
    ],
  },
  disclaimer: {
    description: 'Conditions applying to information and external services linked from this website.',
    sections: [
      ['Municipal information', 'The council endeavours to publish accurate and current information. Official notices and signed documents remain the authoritative record.'],
      ['External services', 'Links to other Government of Uganda platforms are provided for convenience. Those services are managed by their respective public entities.'],
      ['Availability', 'The council may update, archive or withdraw website content when information changes or is no longer current.'],
    ],
  },
  sitemap: {
    description: 'A simple directory of the main information and services available on this website.',
    sections: [],
  },
}

const page = computed(() => content[route.meta.kind] || content.sitemap)
const links = [
  ['Home', '/'], ['About the municipality', '/about'], ['Departments', '/departments'], ['Services', '/services'],
  ['Projects', '/projects'], ['News & publications', '/news'], ['Opportunities', '/opportunities'], ['Contact & feedback', '/contact'],
]
</script>

<template>
  <div>
    <PageIntro :eyebrow="route.meta.eyebrow" :title="route.meta.title" :description="page.description" />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container max-w-4xl">
        <div v-if="route.meta.kind === 'sitemap'" class="grid gap-px bg-civic-900/10 sm:grid-cols-2">
          <RouterLink v-for="link in links" :key="link[1]" class="flex min-h-20 items-center justify-between bg-white px-5 font-extrabold text-civic-900 hover:bg-sage-50" :to="link[1]">{{ link[0] }} <span aria-hidden="true">→</span></RouterLink>
        </div>
        <div v-else class="grid gap-10">
          <article v-for="section in page.sections" :key="section[0]" class="border-b border-civic-900/15 pb-10">
            <h2 class="text-xl font-extrabold tracking-[-0.025em] text-civic-900">{{ section[0] }}</h2>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-ink/65">{{ section[1] }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
