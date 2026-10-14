<script setup>
import { computed } from 'vue'
import { PhArrowUpRight, PhBuildings, PhCalendarBlank, PhCheckCircle, PhMapPinLine } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const programmes = computed(() => cmsContent.projects.filter((item) => item.recordType === 'Programme' || item.contracts?.length || item.activities?.length))
const projects = computed(() => cmsContent.projects.filter((item) => !programmes.value.includes(item)))
const lines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean)
const period = (programme) => [programme.startDate ? new Date(programme.startDate).getUTCFullYear() : '', programme.endDate ? new Date(programme.endDate).getUTCFullYear() : ''].filter(Boolean).join('–')
</script>

<template>
  <div class="programmes-page">
    <PageIntro page-key="projects" eyebrow="Development and infrastructure" title="Programmes and projects" description="Follow municipal investments, delivery contracts and implementation progress." />

    <section v-for="programme in programmes" :key="programme.slug || programme.title" class="programme-record">
      <header class="site-container programme-overview">
        <div class="programme-overview__copy">
          <p class="section-kicker">{{ programme.shortTitle || programme.recordType }}</p>
          <h2>{{ programme.title }}</h2>
          <p>{{ programme.summary }}</p>
          <div class="programme-meta">
            <span><PhCalendarBlank :size="19" /> <strong>{{ period(programme) || 'Dates to be confirmed' }}</strong><small>Programme period</small></span>
            <span><PhBuildings :size="19" /> <strong>{{ programme.status }}</strong><small>Current status</small></span>
            <span><PhMapPinLine :size="19" /> <strong>Makindye Ssabagabo</strong><small>Participating entity</small></span>
          </div>
        </div>
        <aside>
          <p>Implementation</p><h3>{{ programme.implementer }}</h3>
          <dl><div><dt>Funding partners</dt><dd>{{ programme.funders?.join(' · ') || 'See programme records' }}</dd></div><div v-if="programme.lastUpdated"><dt>Progress last updated</dt><dd>{{ formatCmsDate(programme.lastUpdated) }}</dd></div></dl>
          <a v-if="programme.sourceUrl" :href="programme.sourceUrl" target="_blank" rel="noopener noreferrer">Official programme source <PhArrowUpRight :size="17" /></a>
        </aside>
      </header>

      <div v-if="programme.pillars?.length" class="programme-pillars">
        <div class="site-container">
          <div class="programme-section-heading"><p>Programme framework</p><h2>Three connected priorities</h2></div>
          <ol><li v-for="(pillar, index) in programme.pillars" :key="pillar"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ pillar }}</p></li></ol>
          <div v-if="programme.components?.length" class="programme-components"><article v-for="(component, index) in programme.components" :key="component"><span>{{ index === 0 ? 'ISG' : 'MDG' }}</span><p>{{ component }}</p></article></div>
        </div>
      </div>

      <section v-if="programme.contracts?.length" class="site-container programme-contracts">
        <div class="programme-section-heading"><p>Capital delivery</p><h2>Road and drainage contracts</h2><span>{{ programme.contracts.length }} active packages</span></div>
        <div class="programme-table-wrap">
          <table>
            <caption>GKMA-UDP road and drainage contracts in Makindye Ssabagabo</caption>
            <thead><tr><th scope="col">Package and works</th><th scope="col">Contractor</th><th scope="col">Dates</th><th scope="col">Contract sum</th><th scope="col">Status</th></tr></thead>
            <tbody><tr v-for="contract in programme.contracts" :key="contract.id"><th scope="row"><strong>{{ contract.lot }}</strong><span v-for="work in lines(contract.works)" :key="work">{{ work }}</span></th><td data-label="Contractor">{{ contract.contractor }}</td><td data-label="Dates"><time v-if="contract.startDate" :datetime="contract.startDate">{{ formatCmsDate(contract.startDate) }}</time><span aria-hidden="true">→</span><time v-if="contract.completionDate" :datetime="contract.completionDate">{{ formatCmsDate(contract.completionDate) }}</time></td><td data-label="Contract sum" class="programme-amount">{{ contract.contractSum || 'To be confirmed' }}</td><td data-label="Status"><em>{{ contract.status || programme.status }}</em></td></tr></tbody>
          </table>
        </div>
      </section>

      <section v-if="programme.activities?.length" class="programme-progress">
        <div class="site-container">
          <div class="programme-section-heading"><p>Institutional Strengthening Grant</p><h2>Planned work and reported progress</h2><span>{{ programme.activities.length }} activity records</span></div>
          <div class="programme-progress__list"><article v-for="(activity, index) in programme.activities" :key="activity.id"><div class="programme-progress__number">{{ String(index + 1).padStart(2, '0') }}</div><div><span>Planned activity</span><p>{{ activity.planned }}</p></div><div><span>Reported implementation</span><p>{{ activity.implemented }}</p></div><em><PhCheckCircle :size="16" />{{ activity.status || 'Update recorded' }}</em></article></div>
        </div>
      </section>
    </section>

    <section v-if="projects.length" class="site-container standalone-projects">
      <div class="programme-section-heading"><p>Other municipal delivery</p><h2>More projects</h2></div>
      <div><article v-for="project in projects" :key="project.slug || project.title"><img v-if="project.image" :src="project.image" :alt="project.title" /><p>{{ project.sector }}</p><h3>{{ project.title }}</h3><span>{{ project.status }}</span><div>{{ project.summary }}</div></article></div>
    </section>
  </div>
</template>

<style scoped>
.programmes-page { background: #fff; }.programme-record { overflow: clip; }.programme-overview { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(18rem, .65fr); gap: clamp(3rem, 7vw, 7rem); padding-block: 5rem 6.5rem; }.programme-overview__copy h2 { max-width: 52rem; margin-top: .8rem; font-size: clamp(2.2rem, 4.4vw, 4.5rem); font-weight: 850; letter-spacing: -.055em; line-height: 1.02; text-wrap: balance; }.programme-overview__copy > p:last-of-type { max-width: 48rem; margin-top: 1.5rem; color: rgb(21 27 38 / .66); font-size: 1rem; line-height: 1.85; }.programme-meta { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 2.5rem; border-block: 1px solid rgb(23 35 58 / .14); }.programme-meta > span { display: grid; grid-template-columns: auto 1fr; gap: .25rem .7rem; padding: 1.2rem 1rem; border-right: 1px solid rgb(23 35 58 / .12); }.programme-meta > span:last-child { border: 0; }.programme-meta svg { grid-row: 1 / 3; color: #8f3f48; }.programme-meta strong { font-size: .78rem; }.programme-meta small { color: rgb(21 27 38 / .5); font-size: .66rem; }
.programme-overview aside { align-self: end; background: #17233a; padding: 1.8rem; color: white; }.programme-overview aside > p { color: #c98989; font-size: .65rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.programme-overview aside h3 { margin-top: .8rem; font-size: 1rem; line-height: 1.55; }.programme-overview dl { margin-top: 1.8rem; }.programme-overview dl div { border-top: 1px solid rgb(255 255 255 / .14); padding-block: .9rem; }.programme-overview dt { color: rgb(255 255 255 / .5); font-size: .63rem; }.programme-overview dd { margin-top: .35rem; font-size: .74rem; line-height: 1.6; }.programme-overview aside a { display: inline-flex; align-items: center; gap: .5rem; margin-top: 1rem; color: #e1aaaa; font-size: .72rem; font-weight: 750; }
.programme-pillars { background: #f3f5f8; padding-block: 5.5rem 6.5rem; }.programme-section-heading { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: .6rem 2rem; }.programme-section-heading > p { grid-column: 1 / -1; color: #8f3f48; font-size: .68rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }.programme-section-heading h2 { max-width: 48rem; font-size: clamp(1.8rem, 3.2vw, 3.2rem); font-weight: 840; letter-spacing: -.045em; line-height: 1.08; text-wrap: balance; }.programme-section-heading > span { color: rgb(21 27 38 / .45); font-size: .7rem; font-weight: 700; }.programme-pillars ol { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 2.8rem; border-block: 1px solid rgb(23 35 58 / .14); }.programme-pillars li { min-height: 13rem; border-right: 1px solid rgb(23 35 58 / .14); padding: 1.5rem; }.programme-pillars li:last-child { border: 0; }.programme-pillars li span { color: #8f3f48; font-family: ui-monospace, monospace; font-size: .75rem; font-weight: 800; }.programme-pillars li p { margin-top: 2rem; font-size: 1rem; font-weight: 720; line-height: 1.65; }.programme-components { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }.programme-components article { display: grid; grid-template-columns: 3rem 1fr; gap: 1rem; background: white; padding: 1.4rem; }.programme-components span { color: #8f3f48; font-size: .7rem; font-weight: 850; }.programme-components p { color: rgb(21 27 38 / .65); font-size: .8rem; line-height: 1.7; }
.programme-contracts { padding-block: 6rem 7rem; }.programme-table-wrap { margin-top: 2.5rem; overflow-x: auto; }.programme-contracts table { width: 100%; min-width: 68rem; border-collapse: collapse; text-align: left; }.programme-contracts caption { padding-bottom: .8rem; color: rgb(21 27 38 / .5); font-size: .7rem; text-align: left; }.programme-contracts thead { background: #17233a; color: white; }.programme-contracts th,.programme-contracts td { padding: 1rem; border-bottom: 1px solid rgb(23 35 58 / .12); vertical-align: top; font-size: .74rem; line-height: 1.55; }.programme-contracts tbody th { width: 30%; }.programme-contracts tbody th strong { display: block; margin-bottom: .5rem; color: #8f3f48; }.programme-contracts tbody th span { display: block; color: rgb(21 27 38 / .64); font-weight: 500; }.programme-contracts td time { display: block; }.programme-contracts td > span { color: rgb(21 27 38 / .35); }.programme-amount { font-variant-numeric: tabular-nums; white-space: nowrap; }.programme-contracts em { display: inline-block; background: #dfe4eb; padding: .35rem .5rem; color: #243552; font-size: .65rem; font-style: normal; font-weight: 750; }
.programme-progress { background: #17233a; padding-block: 6rem 7rem; color: white; }.programme-progress .programme-section-heading > p { color: #c98989; }.programme-progress .programme-section-heading > span { color: rgb(255 255 255 / .45); }.programme-progress__list { margin-top: 2.5rem; }.programme-progress__list article { display: grid; grid-template-columns: 3rem 1fr 1fr 9rem; gap: 1.5rem; border-top: 1px solid rgb(255 255 255 / .15); padding-block: 1.5rem; }.programme-progress__number { color: #c98989; font-family: ui-monospace, monospace; font-size: .7rem; font-weight: 800; }.programme-progress__list article div > span { color: rgb(255 255 255 / .45); font-size: .63rem; font-weight: 750; text-transform: uppercase; }.programme-progress__list article p { margin-top: .45rem; color: rgb(255 255 255 / .72); font-size: .8rem; line-height: 1.7; }.programme-progress__list em { display: flex; align-items: start; gap: .4rem; color: #e1aaaa; font-size: .68rem; font-style: normal; font-weight: 750; }.standalone-projects { padding-block: 6rem; }.standalone-projects > div:last-child { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem; }.standalone-projects article { background: #f3f5f8; padding-bottom: 1.5rem; }.standalone-projects img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }.standalone-projects article > :not(img) { margin-inline: 1.2rem; }.standalone-projects article > p { margin-top: 1rem; color: #8f3f48; font-size: .65rem; font-weight: 750; }.standalone-projects h3 { margin-top: .5rem; font-size: 1rem; }.standalone-projects article > span { display: block; margin-top: .7rem; font-size: .7rem; }.standalone-projects article > div { margin-top: .7rem; color: rgb(21 27 38 / .6); font-size: .78rem; line-height: 1.6; }
@media (max-width: 950px) { .programme-overview { grid-template-columns: 1fr; }.programme-pillars ol { grid-template-columns: 1fr; }.programme-pillars li { min-height: 0; border-right: 0; border-bottom: 1px solid rgb(23 35 58 / .14); }.programme-progress__list article { grid-template-columns: 2rem 1fr; }.programme-progress__list article > div:nth-child(3),.programme-progress__list article > em { grid-column: 2; }.standalone-projects > div:last-child { grid-template-columns: 1fr 1fr; } }
@media (max-width: 650px) { .programme-overview { padding-block: 3.5rem 4.5rem; }.programme-meta,.programme-components { grid-template-columns: 1fr; }.programme-meta > span { border-right: 0; border-bottom: 1px solid rgb(23 35 58 / .12); }.programme-section-heading { grid-template-columns: 1fr; }.programme-table-wrap { overflow: visible; }.programme-contracts table,.programme-contracts tbody,.programme-contracts tr,.programme-contracts th,.programme-contracts td { display: block; min-width: 0; }.programme-contracts thead { display: none; }.programme-contracts tbody { display: grid; gap: 1rem; }.programme-contracts tr { border-left: 3px solid #8f3f48; background: #f3f5f8; padding: .5rem 1rem; }.programme-contracts th,.programme-contracts td { width: auto !important; border-bottom: 1px solid rgb(23 35 58 / .1); padding-inline: 0; }.programme-contracts td::before { display: block; margin-bottom: .25rem; color: rgb(21 27 38 / .45); content: attr(data-label); font-size: .58rem; font-weight: 800; text-transform: uppercase; }.standalone-projects > div:last-child { grid-template-columns: 1fr; } }
</style>
