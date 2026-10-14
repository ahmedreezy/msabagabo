<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowRight, PhEnvelopeSimple, PhGavel, PhUsersThree } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import PublicBodyDirectory from '../components/PublicBodyDirectory.vue'
import { cmsContent } from '../stores/cmsContent'
import NotFoundView from './NotFoundView.vue'
import { departmentFaqs, departmentSectors } from '../lib/departmentContent.js'

const route = useRoute()
const department = computed(() => cmsContent.departments.find((item) => item.slug === route.params.slug))
const sectors = computed(() => departmentSectors(department.value))
const faqs = computed(() => departmentFaqs(department.value))
const publicBodies = computed(() => Array.isArray(department.value?.publicBodies) ? department.value.publicBodies.filter((body) => body?.name) : [])
</script>

<template>
  <div v-if="department" class="department-page">
    <PageIntro eyebrow="Municipal department" :title="department.name" :description="department.summary">
      <template #breadcrumb><RouterLink class="hover:text-orange-600" to="/departments">Departments</RouterLink><span class="mx-2 text-ink/25">/</span><span>{{ department.shortName }}</span></template>
    </PageIntro>

    <nav class="department-jump" aria-label="On this page">
      <div class="site-container"><strong>On this page</strong><a href="#mandate">Mandate</a><a href="#sectors">Sectors</a><a href="#department-faqs">Frequently asked questions</a><a v-if="publicBodies.length" href="#public-bodies">Development forum</a><a href="#department-contact">Contact</a></div>
    </nav>

    <div class="site-container department-layout">
      <main class="department-content">
        <section id="mandate" class="department-section department-mandate" tabindex="-1">
          <p class="section-kicker">01 · Mandate</p><h2>What the department is responsible for</h2><p>{{ department.mandate }}</p>
        </section>

        <section id="sectors" class="department-section" tabindex="-1">
          <p class="section-kicker">02 · Structure</p>
          <div class="department-section__heading"><h2>Sectors under the department</h2><span>{{ sectors.length }} {{ sectors.length === 1 ? 'sector' : 'sectors' }}</span></div>
          <div v-if="sectors.length" class="department-sectors"><article v-for="(sector, index) in sectors" :key="sector.id"><span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ sector.name }}</h3><p v-if="sector.summary">{{ sector.summary }}</p></div></article></div>
          <div v-else class="department-empty"><h3>Sector information is being prepared</h3><p>Contact the department for its current organisational structure.</p></div>
        </section>

        <section id="department-faqs" class="department-section" tabindex="-1">
          <p class="section-kicker">03 · Public guidance</p>
          <div class="department-section__heading"><h2>Frequently asked questions</h2><span>{{ faqs.length }} {{ faqs.length === 1 ? 'answer' : 'answers' }}</span></div>
          <div v-if="faqs.length" class="department-faqs"><article v-for="(faq, index) in faqs" :key="faq.id"><span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ faq.question }}</h3><p>{{ faq.answer }}</p></div></article></div>
          <div v-else class="department-empty"><h3>No departmental FAQs have been published yet</h3><p>Use the official contact route for current guidance.</p></div>
        </section>

        <section v-if="publicBodies.length" id="public-bodies" class="department-section" tabindex="-1">
          <p class="section-kicker">04 · Community representation</p>
          <PublicBodyDirectory v-for="body in publicBodies" :key="body.id || body.name" :body="body" />
        </section>

        <details v-if="department.authority" class="department-authority"><summary><span><PhGavel :size="22" /> Legal authority</span></summary><p>{{ department.authority }}</p></details>

        <section v-if="department.services?.length" class="department-section department-services"><p class="section-kicker">Service routes</p><h2>How this department can help</h2><ul><li v-for="service in department.services" :key="service"><PhArrowRight :size="16" weight="bold" />{{ service }}</li></ul></section>

        <section v-if="department.team?.length" class="department-section"><p class="section-kicker">Department team</p><h2>People serving this department</h2><div class="department-team"><article v-for="member in department.team" :key="`${member.name}-${member.role}`"><img v-if="member.photo" :src="member.photo" :alt="`${member.name}, ${member.role}`" /><div><p>{{ member.role }}</p><h3>{{ member.name }}</h3></div></article></div></section>
      </main>

      <aside id="department-contact" class="department-contact">
        <p>Department contact</p><PhUsersThree :size="30" /><h2>{{ department.lead || `Contact ${department.name}` }}</h2>
        <a v-if="department.contact" :href="`mailto:${department.contact}`"><PhEnvelopeSimple :size="18" />{{ department.contact }}</a>
        <RouterLink to="/contact#contact-details">Council contact details <PhArrowRight :size="16" weight="bold" /></RouterLink>
      </aside>
    </div>
  </div>
  <div v-else-if="!cmsContent.loaded" class="site-container py-20" role="status">Loading department…</div>
  <NotFoundView v-else />
</template>

<style scoped>
.department-page { background: #fff; }
.department-jump { position: sticky; top: var(--site-header-height, 0); z-index: 10; border-bottom: 1px solid rgb(23 35 58 / .1); background: rgb(255 255 255 / .96); backdrop-filter: blur(14px); }
.department-jump > div { display: flex; min-height: 3.6rem; align-items: center; gap: 1.35rem; overflow-x: auto; }
.department-jump strong { color: #17233a; font-size: .72rem; white-space: nowrap; }.department-jump a { color: rgb(21 27 38 / .62); font-size: .72rem; font-weight: 650; white-space: nowrap; }.department-jump a:hover { color: #8f3f48; }
.department-layout { display: grid; grid-template-columns: minmax(0, 1fr) 19rem; gap: clamp(3rem, 7vw, 7rem); align-items: start; padding-block: 4.5rem 7rem; }.department-content { min-width: 0; }
.department-section { scroll-margin-top: calc(var(--site-header-height, 0px) + 5rem); border-top: 1px solid rgb(23 35 58 / .12); padding-block: 3.5rem 4rem; }.department-section:first-child { border-top: 0; padding-top: 0; }
.department-section h2 { max-width: 42rem; margin-top: .7rem; font-size: clamp(1.85rem, 3.2vw, 3rem); font-weight: 820; letter-spacing: -.045em; line-height: 1.12; text-wrap: balance; }
.department-mandate > p:last-child { max-width: 52rem; margin-top: 1.5rem; color: rgb(21 27 38 / .72); font-family: var(--font-serif); font-size: clamp(1.15rem, 2vw, 1.45rem); line-height: 1.8; }
.department-section__heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }.department-section__heading > span { color: rgb(21 27 38 / .45); font-size: .72rem; font-weight: 700; white-space: nowrap; }
.department-sectors { display: grid; grid-template-columns: 1fr 1fr; margin-top: 2rem; border-top: 1px solid rgb(23 35 58 / .16); }.department-sectors article { display: grid; grid-template-columns: 2.5rem 1fr; gap: .8rem; border-bottom: 1px solid rgb(23 35 58 / .12); padding: 1.4rem 1rem 1.4rem 0; }.department-sectors article:nth-child(odd) { border-right: 1px solid rgb(23 35 58 / .12); }.department-sectors article:nth-child(even) { padding-left: 1.2rem; }
.department-sectors article > span,.department-faqs article > span { color: #8f3f48; font-family: ui-monospace, monospace; font-size: .7rem; font-weight: 800; font-variant-numeric: tabular-nums; }.department-sectors h3,.department-faqs h3 { font-size: 1rem; font-weight: 780; line-height: 1.45; }.department-sectors p { margin-top: .45rem; color: rgb(21 27 38 / .58); font-size: .82rem; line-height: 1.7; }
.department-faqs { margin-top: 1.5rem; }.department-faqs article { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); gap: .8rem; border-bottom: 1px solid rgb(23 35 58 / .13); padding-block: 1.75rem; }.department-faqs p { max-width: 50rem; margin-top: .75rem; color: rgb(21 27 38 / .65); font-size: .92rem; line-height: 1.8; white-space: pre-line; }
.department-empty { margin-top: 2rem; border-left: 3px solid #dfe4eb; background: #f3f5f8; padding: 1.3rem 1.5rem; }.department-empty h3 { font-size: .95rem; }.department-empty p { margin-top: .4rem; color: rgb(21 27 38 / .6); font-size: .82rem; }
.department-authority { border-block: 1px solid rgb(23 35 58 / .12); }.department-authority summary { display: flex; cursor: pointer; align-items: center; justify-content: space-between; padding: 1.4rem 0; font-size: .9rem; font-weight: 780; }.department-authority summary span { display: flex; align-items: center; gap: .7rem; }.department-authority p { max-width: 48rem; padding: 0 0 1.5rem 2.8rem; color: rgb(21 27 38 / .64); font-size: .86rem; line-height: 1.75; }
.department-services ul { display: grid; grid-template-columns: 1fr 1fr; gap: 0 2rem; margin-top: 1.5rem; }.department-services li { display: flex; align-items: center; gap: .7rem; border-bottom: 1px solid rgb(23 35 58 / .1); padding-block: 1rem; color: rgb(21 27 38 / .7); font-size: .86rem; }.department-services svg { flex: none; color: #8f3f48; }
.department-team { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem; }.department-team article { display: flex; align-items: center; gap: 1rem; background: #f3f5f8; padding: 1rem; }.department-team img { width: 4.25rem; height: 5rem; object-fit: cover; }.department-team p { color: #3d5070; font-size: .7rem; }.department-team h3 { margin-top: .25rem; font-size: .95rem; }
.department-contact { position: sticky; top: calc(var(--site-header-height, 0px) + 5rem); background: #17233a; padding: 1.6rem; color: white; }.department-contact > p { color: #c98989; font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.department-contact > svg { margin-top: 2.3rem; color: #c98989; }.department-contact h2 { margin-top: 1rem; font-size: 1.2rem; font-weight: 790; line-height: 1.35; }.department-contact a { display: flex; align-items: center; gap: .6rem; overflow-wrap: anywhere; }.department-contact > a { margin-top: 1rem; color: rgb(255 255 255 / .7); font-size: .78rem; }.department-contact > :last-child { margin-top: 1.8rem; color: #e1aaaa; font-size: .78rem; font-weight: 780; }
@media (max-width: 900px) { .department-layout { grid-template-columns: 1fr; padding-top: 3rem; }.department-contact { position: static; }.department-sectors,.department-services ul { grid-template-columns: 1fr; }.department-sectors article { border-right: 0 !important; padding-left: 0 !important; }.department-jump strong { display: none; } }
@media (max-width: 560px) { .department-layout { padding-bottom: 4rem; }.department-section { padding-block: 2.7rem 3rem; }.department-section__heading { align-items: start; flex-direction: column; gap: .6rem; }.department-team { grid-template-columns: 1fr; }.department-faqs article { grid-template-columns: 1.6rem minmax(0, 1fr); } }
</style>
