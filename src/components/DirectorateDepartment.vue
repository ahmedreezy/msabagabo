<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhArrowUpRight, PhEnvelopeSimple, PhPhone, PhUsersThree } from '@phosphor-icons/vue'
import DirectorateFaqSection from './DirectorateFaqSection.vue'
import { formatCmsDate } from '../stores/cmsContent'
import { safeLink } from '../lib/educationProfile.js'
import './education.css'

const props = defineProps({
  department: { type: Object, required: true },
  faqs: { type: Array, default: () => [] },
  preview: Boolean,
})

const route = useRoute()
const prefix = useId()
const page = ref(null)
const sectionMenu = ref(null)
const activeSection = ref('overview')
const brokenImages = ref(new Set())
const team = computed(() => (props.department.team || []).filter((person) => person.name && person.role))
const sections = computed(() => [
  { id: 'overview', label: 'Overview', visible: true },
  { id: 'mandate', label: 'Mandate & authority', visible: props.department.mandate || props.department.authority },
  { id: 'units', label: 'Units & sections', visible: props.department.units?.length },
  { id: 'services', label: 'Services', visible: props.department.services?.length },
  { id: 'faqs', label: 'Frequently asked questions', visible: props.faqs.length },
  { id: 'contact', label: 'Leadership & contact', visible: true },
].filter((section) => section.visible))
const anchorId = (id) => props.preview && route.meta.admin ? `${prefix}-${id}` : id
const imageAvailable = (url) => safeLink(url) && !brokenImages.value.has(url)
const imageFailed = (url) => { brokenImages.value = new Set([...brokenImages.value, url]) }

const goToSection = async (id, updateHistory = true) => {
  if (sectionMenu.value) sectionMenu.value.open = false
  await nextTick()
  const target = page.value?.querySelector(`[id="${anchorId(id)}"]`)
  if (!target) return
  if (updateHistory && !route.meta.admin) window.history.replaceState(window.history.state, '', `#${id}`)
  target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
  activeSection.value = id
}

let observer
let headerObserver
let initialHashHandled = false
const connectSections = async () => {
  await nextTick()
  observer?.disconnect()
  if (!page.value) return
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible.length) activeSection.value = visible[0].target.dataset.section
  }, { rootMargin: '-10% 0px -65% 0px' })
  page.value.querySelectorAll('[data-section]').forEach((section) => observer.observe(section))
  const hash = window.location.hash.slice(1)
  if (!initialHashHandled && !route.meta.admin && sections.value.some(({ id }) => id === hash)) {
    initialHashHandled = true
    await goToSection(hash, false)
  }
}

onMounted(async () => {
  const header = document.querySelector('.site-header')
  if (header && !route.meta.admin) {
    headerObserver = new ResizeObserver(() => page.value?.style.setProperty('--education-offset', `${header.getBoundingClientRect().height + 24}px`))
    headerObserver.observe(header)
    page.value?.style.setProperty('--education-offset', `${header.getBoundingClientRect().height + 24}px`)
  }
  await connectSections()
})
watch(sections, connectSections)
watch(() => props.department, () => { activeSection.value = 'overview'; initialHashHandled = false; brokenImages.value = new Set(); connectSections() })
onBeforeUnmount(() => { observer?.disconnect(); headerObserver?.disconnect() })
</script>

<template>
  <article ref="page" class="education-page directorate-page" :class="{ 'education-page--preview': preview }">
    <div v-if="preview" class="education-draft-bar"><span>Content preview</span> Review this directorate before publication</div>

    <header class="education-intro directorate-intro">
      <div class="site-container">
        <nav class="education-breadcrumb" aria-label="Breadcrumb"><RouterLink to="/">Home</RouterLink><span aria-hidden="true">/</span><RouterLink to="/directorates">Directorates</RouterLink><span aria-hidden="true">/</span><span aria-current="page">{{ department.shortName || department.name }}</span></nav>
        <p class="education-eyebrow">Makindye Ssabagabo Municipal Council <span>Directorate</span></p>
        <h1>{{ department.name }}</h1>
        <p class="education-intro__summary">{{ department.summary }}</p>
        <div class="education-intro__actions">
          <a v-if="department.services?.length" class="education-button" :href="`#${anchorId('services')}`" @click.prevent="goToSection('services')">View services <PhArrowRight :size="19" /></a>
          <a class="education-text-link" :href="`#${anchorId('contact')}`" @click.prevent="goToSection('contact')">Contact the directorate <PhArrowUpRight :size="19" /></a>
        </div>
      </div>
    </header>

    <div class="site-container education-layout">
      <aside class="education-sidebar">
        <nav class="education-desktop-nav" aria-label="On this page">
          <p>On this page</p>
          <a v-for="(section, index) in sections" :key="section.id" :href="`#${anchorId(section.id)}`" :aria-current="activeSection === section.id ? 'location' : undefined" @click.prevent="goToSection(section.id)"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ section.label }}</a>
          <RouterLink class="education-all-departments" to="/directorates">All directorates <PhArrowUpRight :size="16" /></RouterLink>
        </nav>
        <details ref="sectionMenu" class="education-mobile-nav">
          <summary>On this page <span>{{ sections.length }} sections</span></summary>
          <nav aria-label="On this page"><a v-for="section in sections" :key="section.id" :href="`#${anchorId(section.id)}`" @click.prevent="goToSection(section.id)">{{ section.label }}</a></nav>
        </details>
      </aside>

      <div class="education-content">
        <section :id="anchorId('overview')" data-section="overview" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Directorate overview</p>
          <h2>About {{ department.shortName || department.name }}</h2>
          <p class="education-section__intro">{{ department.summary }}</p>
          <dl class="directorate-overview-grid">
            <div><dt>Directorate lead</dt><dd>{{ department.lead }}</dd></div>
            <div><dt>Units and sections</dt><dd>{{ department.units?.length || 0 }}</dd></div>
            <div><dt>Public services listed</dt><dd>{{ department.services?.length || 0 }}</dd></div>
          </dl>
        </section>

        <section v-if="department.mandate || department.authority" :id="anchorId('mandate')" data-section="mandate" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Public responsibility</p>
          <h2>Mandate and legal authority</h2>
          <p v-if="department.mandate" class="education-section__intro directorate-mandate">{{ department.mandate }}</p>
          <p v-if="department.fieldSources?.mandate" class="education-inline-review">Source: {{ department.fieldSources.mandate.sourceTitle }} · {{ department.fieldSources.mandate.sourceSection }}</p>
          <div v-if="department.authority" class="education-authority"><h3>Legal authority</h3><p>{{ department.authority }}</p></div>
        </section>

        <section v-if="department.units?.length" :id="anchorId('units')" data-section="units" tabindex="-1" class="education-section">
          <p class="education-eyebrow">How the work is organised</p>
          <h2>Units and sections</h2>
          <dl class="education-units"><div v-for="unit in department.units" :key="unit"><dt>{{ unit }}</dt></div></dl>
          <p v-if="department.fieldSources?.units" class="education-inline-review">Source: {{ department.fieldSources.units.sourceTitle }} · {{ department.fieldSources.units.sourceSection }}</p>
        </section>

        <section v-if="department.services?.length" :id="anchorId('services')" data-section="services" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Here to help</p>
          <h2>Services and guidance</h2>
          <p class="education-section__intro">Start with the service that best matches your enquiry.</p>
          <ol class="directorate-service-list">
            <li v-for="(service, index) in department.services" :key="service"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ service }}</strong></li>
          </ol>
        </section>

        <DirectorateFaqSection v-if="faqs.length" :faqs="faqs" :section-id="anchorId('faqs')" :heading-id="`${prefix}-faqs-heading`" variant="education" data-section="faqs" />

        <section :id="anchorId('contact')" data-section="contact" tabindex="-1" class="education-section">
          <p class="education-eyebrow">People and support</p>
          <h2>Leadership and contact</h2>
          <div v-if="team.length" class="education-team"><article v-for="person in team" :key="`${person.name}-${person.role}`"><img v-if="imageAvailable(person.photo)" :src="person.photo" :alt="`${person.name}, ${person.role}`" loading="lazy" @error="imageFailed(person.photo)" /><div><p>{{ person.role }}</p><h3>{{ person.name }}</h3></div></article></div>
          <div class="directorate-contact-card">
            <PhUsersThree :size="27" weight="regular" />
            <div><p>Responsible office</p><h3>{{ department.lead }}</h3></div>
            <a v-if="department.contact" :href="`mailto:${department.contact}`"><PhEnvelopeSimple :size="18" />{{ department.contact }}</a>
            <RouterLink v-else to="/contact"><PhPhone :size="18" />Council contact details</RouterLink>
          </div>
          <div class="education-help"><div><h3>Need help finding the right officer?</h3><p>Contact the council and ask for {{ department.name }}.</p></div><RouterLink class="education-button" to="/contact#contact-details">Council contact details <PhArrowUpRight :size="18" /></RouterLink></div>
        </section>

        <footer v-if="department.sourceTitle" class="directorate-source"><span><strong>Source:</strong> {{ department.sourceTitle }}</span><span v-if="department.lastReviewed">Reviewed {{ formatCmsDate(department.lastReviewed) }}</span></footer>
      </div>
    </div>
  </article>
</template>
