<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhArrowUpRight, PhBookOpenText, PhEnvelopeSimple, PhMagnifyingGlass, PhPhone, PhMapPin } from '@phosphor-icons/vue'
import { emailLink, filterSchools, normalizeEducationProfile, phoneLink, publicEducationProfile, safeLink } from '../lib/educationProfile.js'
import './education.css'

const props = defineProps({ department: { type: Object, required: true }, preview: Boolean })
const route = useRoute()
const prefix = useId()
const page = ref(null)
const sectionMenu = ref(null)
const activeSection = ref('guidance')
const query = ref('')
const level = ref('')
const programme = ref('')
const brokenImages = ref(new Set())
const profile = computed(() => props.preview ? normalizeEducationProfile(props.department.educationProfile) : publicEducationProfile(props.department) || normalizeEducationProfile())
const results = computed(() => filterSchools(profile.value.schools, query.value, level.value, programme.value))
const team = computed(() => (props.department.team || []).filter((person) => person.name && person.role))
const responsibilities = computed(() => profile.value.units.length ? profile.value.units : (props.department.units || []).map((title, index) => ({ id: `unit-${index}`, title })))
const sections = computed(() => [
  { id: 'guidance', label: 'Services & guidance', visible: props.preview || profile.value.guidance.length },
  { id: 'schools', label: 'Find a school', visible: props.preview || profile.value.schools.length },
  { id: 'responsibilities', label: 'Responsibilities & units', visible: props.department.mandate || props.department.authority || responsibilities.value.length },
  { id: 'contact', label: 'Leadership & contact', visible: true },
  { id: 'activities', label: 'Projects & activities', visible: props.preview || profile.value.activities.length },
  { id: 'documents', label: 'Documents', visible: props.preview || profile.value.documents.length },
].filter((section) => section.visible))
const anchorId = (id) => props.preview && route.meta.admin ? `${prefix}-${id}` : id
const imageAvailable = (url) => safeLink(url) && !brokenImages.value.has(url)
const imageFailed = (url) => { brokenImages.value = new Set([...brokenImages.value, url]) }
const resetFilters = () => { query.value = ''; level.value = ''; programme.value = '' }
const formatDate = (value) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('en-UG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : ''

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
  if (!page.value) return
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible.length) activeSection.value = visible[0].target.dataset.section
  }, { rootMargin: '-10% 0px -65% 0px' })
  page.value?.querySelectorAll('[data-section]').forEach((section) => observer.observe(section))
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
watch(() => props.department, () => { resetFilters(); brokenImages.value = new Set() })
onBeforeUnmount(() => { observer?.disconnect(); headerObserver?.disconnect() })
</script>

<template>
  <article ref="page" class="education-page" :class="{ 'education-page--preview': preview }">
    <div v-if="preview" class="education-draft-bar"><span>Development preview</span> Research draft · Information awaits departmental review</div>
    <header class="education-intro">
      <div class="site-container">
        <nav class="education-breadcrumb" aria-label="Breadcrumb"><RouterLink to="/">Home</RouterLink><span aria-hidden="true">/</span><RouterLink to="/departments">Departments</RouterLink><span aria-hidden="true">/</span><span aria-current="page">Education &amp; Sports</span></nav>
        <p class="education-eyebrow">Makindye Ssabagabo Municipal Council <span>Department</span></p>
        <h1>{{ department.name }}</h1>
        <p class="education-intro__summary">{{ department.summary }}</p>
        <div class="education-intro__actions">
          <a v-if="sections.some(({ id }) => id === 'schools')" class="education-button" :href="`#${anchorId('schools')}`" @click.prevent="goToSection('schools')">Find a school <PhArrowRight :size="19" /></a>
          <a class="education-text-link" :href="`#${anchorId('contact')}`" @click.prevent="goToSection('contact')">Get help from the council <PhArrowUpRight :size="19" /></a>
        </div>
      </div>
    </header>

    <div class="site-container education-layout">
      <aside class="education-sidebar">
        <nav class="education-desktop-nav" aria-label="On this page">
          <p>On this page</p>
          <a v-for="(section, index) in sections" :key="section.id" :href="`#${anchorId(section.id)}`" :aria-current="activeSection === section.id ? 'location' : undefined" @click.prevent="goToSection(section.id)"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ section.label }}</a>
          <RouterLink class="education-all-departments" to="/departments">All departments <PhArrowUpRight :size="16" /></RouterLink>
        </nav>
        <details ref="sectionMenu" class="education-mobile-nav">
          <summary>On this page <span>{{ sections.length }} sections</span></summary>
          <nav aria-label="On this page"><a v-for="section in sections" :key="section.id" :href="`#${anchorId(section.id)}`" @click.prevent="goToSection(section.id)">{{ section.label }}</a></nav>
        </details>
      </aside>

      <div class="education-content">
        <details v-if="preview" class="education-review-note"><summary>Editorial review notes</summary><p>{{ department.educationProfile?.reviewNotes || 'Review the introduction, mandate, authority and staff before approving this page.' }}</p></details>

        <section v-if="preview || profile.guidance.length" :id="anchorId('guidance')" data-section="guidance" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Here to help</p><h2>Services &amp; guidance</h2><p class="education-section__intro">Find the right starting point for your education enquiry.</p>
          <div class="education-guidance">
            <article v-for="(service, index) in profile.guidance" :key="service.id" class="education-service">
              <span class="education-service__number">{{ String(index + 1).padStart(2, '0') }}</span>
              <div><h3>{{ service.title }}</h3><p>{{ service.audience }}</p><ol><li v-for="(step, stepIndex) in service.steps" :key="stepIndex">{{ step }}</li></ol><div class="education-service__office"><span>{{ service.responsible }}</span><a :href="`#${anchorId('contact')}`" @click.prevent="goToSection('contact')">Contact routes <PhArrowRight :size="16" /></a></div><p v-if="preview && service.reviewNote" class="education-inline-review">Review: {{ service.reviewNote }}</p></div>
            </article>
          </div>
          <p v-if="preview && !profile.guidance.length" class="education-missing">Add service guidance and confirm each next step with the department.</p>
        </section>

        <section v-if="preview || profile.schools.length" :id="anchorId('schools')" data-section="schools" tabindex="-1" class="education-section">
          <div class="education-section__heading"><div><p class="education-eyebrow">School directory</p><h2>Find a school</h2></div><PhBookOpenText :size="40" weight="light" /></div>
          <p class="education-section__intro">Browse the listed primary, secondary and partnership schools.</p>
          <p v-if="preview" class="education-inline-review">Research list from the municipal education page. Names, programme classifications and current details await confirmation.</p>
          <div class="education-school-filters">
            <label class="education-school-search" :for="`${prefix}-search`"><span>School name</span><span class="education-search-input"><PhMagnifyingGlass :size="19" /><input :id="`${prefix}-search`" v-model="query" type="search" placeholder="Search schools" /></span></label>
            <label :for="`${prefix}-level`"><span>Level</span><select :id="`${prefix}-level`" v-model="level" aria-label="Level"><option value="">All levels</option><option>Primary</option><option>Secondary</option></select></label>
            <label :for="`${prefix}-programme`"><span>Programme</span><select :id="`${prefix}-programme`" v-model="programme" aria-label="Programme"><option value="">All programmes</option><option>UPE</option><option>USE</option><option>Partnership</option></select></label>
          </div>
          <div class="education-school-count"><p role="status" aria-live="polite" aria-atomic="true">{{ results.length }} {{ results.length === 1 ? 'school' : 'schools' }} shown<span v-if="preview"> · Draft records</span></p><button v-if="query || level || programme" type="button" @click="resetFilters">Clear filters</button></div>
          <ul v-if="results.length" class="education-schools">
            <li v-for="school in results" :key="school.id"><div><h3>{{ school.name }}</h3><p>{{ school.level }} <span aria-hidden="true">·</span> {{ school.programme }}</p><p v-if="school.location" class="education-school-location"><PhMapPin :size="15" />{{ school.location }}</p></div><div v-if="phoneLink(school.phone) || emailLink(school.email)" class="education-school-contacts"><a v-if="phoneLink(school.phone)" :href="phoneLink(school.phone)"><PhPhone :size="16" />{{ school.phone }}</a><a v-if="emailLink(school.email)" :href="emailLink(school.email)"><PhEnvelopeSimple :size="16" />{{ school.email }}</a></div></li>
          </ul>
          <div v-else class="education-empty" role="status"><PhMagnifyingGlass :size="28" /><h3>No schools match your search</h3><p>Try another school name or clear the filters to see the full list.</p><button class="education-button" type="button" @click="resetFilters">Clear filters</button></div>
        </section>

        <section v-if="sections.some(({ id }) => id === 'responsibilities')" :id="anchorId('responsibilities')" data-section="responsibilities" tabindex="-1" class="education-section">
          <p class="education-eyebrow">The department’s work</p><h2>Responsibilities &amp; units</h2><p v-if="department.mandate" class="education-section__intro">{{ department.mandate }}</p>
          <dl class="education-units"><div v-for="unit in responsibilities" :key="unit.id"><dt>{{ unit.title }}</dt><dd v-if="unit.description">{{ unit.description }}</dd></div></dl>
          <div v-if="department.authority" class="education-authority"><h3>Mandate and legal authority</h3><p>{{ department.authority }}</p></div>
        </section>

        <section :id="anchorId('contact')" data-section="contact" tabindex="-1" class="education-section">
          <p class="education-eyebrow">People and support</p><h2>Leadership &amp; contact</h2>
          <div v-if="team.length" class="education-team"><article v-for="(person, index) in team" :key="`${person.name}-${index}`"><img v-if="imageAvailable(person.photo)" :src="person.photo" :alt="`${person.name}, ${person.role}`" loading="lazy" @error="imageFailed(person.photo)" /><div><p>{{ person.role }}</p><h3>{{ person.name }}</h3></div></article></div>
          <p v-else-if="preview" class="education-missing">Add verified department officers in the team editor. Portraits are optional.</p>
          <div v-if="profile.contacts.length" class="education-contact-list"><div v-for="contact in profile.contacts" :key="contact.id"><p>{{ contact.label }}</p><a v-if="contact.kind === 'Email' && emailLink(contact.value)" :href="emailLink(contact.value)"><PhEnvelopeSimple :size="19" />{{ contact.value }}</a><a v-else-if="contact.kind === 'Telephone' && phoneLink(contact.value)" :href="phoneLink(contact.value)"><PhPhone :size="19" />{{ contact.value }}</a></div></div>
          <div class="education-help"><div><h3>Need help reaching the department?</h3><p>Use the council’s contact details and ask for Education &amp; Sports.</p></div><RouterLink class="education-button" to="/contact#contact-details">Council contact details <PhArrowUpRight :size="18" /></RouterLink></div>
        </section>

        <section v-if="preview || profile.activities.length" :id="anchorId('activities')" data-section="activities" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Education in the municipality</p><h2>Projects &amp; activities</h2>
          <div class="education-activities"><article v-for="activity in profile.activities" :key="activity.id"><figure v-if="imageAvailable(activity.image)"><img :src="activity.image" :alt="activity.caption || activity.title" loading="lazy" @error="imageFailed(activity.image)" /><figcaption>{{ activity.caption }}</figcaption></figure><time v-if="formatDate(activity.date)" :datetime="activity.date">{{ formatDate(activity.date) }}</time><p v-else-if="preview" class="education-inline-review">Historical record · Update date to confirm</p><h3>{{ activity.title }}</h3><p>{{ activity.description }}</p><p v-if="preview && activity.reviewNote" class="education-inline-review">Review: {{ activity.reviewNote }}</p></article></div>
          <p v-if="preview && !profile.activities.length" class="education-missing">Add dated school improvements or sports activities with verified photographs and captions.</p>
        </section>

        <section v-if="preview || profile.documents.length" :id="anchorId('documents')" data-section="documents" tabindex="-1" class="education-section">
          <p class="education-eyebrow">Resources</p><h2>Documents &amp; guidance</h2>
          <ul class="education-documents"><li v-for="document in profile.documents" :key="document.id"><a v-if="safeLink(document.url)" :href="safeLink(document.url)" target="_blank" rel="noopener noreferrer"><span><strong>{{ document.title }}</strong><small>{{ document.format }} · Opens in a new tab</small></span><PhArrowUpRight :size="22" /></a><p v-else-if="preview" class="education-missing">{{ document.title || 'Untitled document' }} · Add a valid document link.</p></li></ul>
          <p v-if="preview && !profile.documents.length" class="education-missing">Add verified education forms, guidance or reports. This section stays hidden on the published page until documents are available.</p>
        </section>
      </div>
    </div>
  </article>
</template>
