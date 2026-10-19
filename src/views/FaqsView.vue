<script setup>
import { computed, ref } from 'vue'
import { PhArrowRight, PhChatCircleText, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'
import { allDepartmentFaqs } from '../lib/departmentContent.js'

const generalQuestions = [
  { id: 'find-service', question: 'How do I find the municipal service I need?', answer: 'Use the service directory to search by service or responsible department.', link: 'Browse services', to: '/services' },
  { id: 'department-contacts', question: 'Where can I find department contacts and responsibilities?', answer: 'Each department page lists its mandate, sectors, frequently asked questions, services and official contact route.', link: 'View departments', to: '/departments' },
  { id: 'tender-notices', question: 'Where are tender notices published?', answer: 'Current procurement notices and supplier information are listed on the Tenders page.', link: 'View tenders', to: '/tenders' },
  { id: 'careers', question: 'How can I apply for a council job or internship?', answer: 'Open vacancies and placement notices appear on the Careers page with their application requirements.', link: 'View careers', to: '/careers' },
  { id: 'public-documents', question: 'Where can I access budgets, plans and policies?', answer: 'The Municipal Notice Board brings together approved municipal publications and downloadable public documents.', link: 'Open the Municipal Notice Board', to: '/municipal-notice-board' },
  { id: 'feedback', question: 'How do I report a problem or send feedback?', answer: 'Use the citizen feedback form or contact the council by telephone or email.', link: 'Send feedback', to: '/contact#e8ebf0ck' },
]

const query = ref('')
const selectedGroup = ref('all')
const departmentQuestions = computed(() => allDepartmentFaqs(cmsContent.departments))
const allQuestions = computed(() => [
  ...generalQuestions.map((item) => ({ ...item, group: 'general', departmentName: 'General council information' })),
  ...departmentQuestions.value.map((item) => ({
    ...item,
    group: item.departmentSlug,
    link: 'View department',
    to: `/departments/${item.departmentSlug}#department-faqs`,
  })),
])
const groupOptions = computed(() => {
  const departments = cmsContent.departments
    .filter((department) => departmentQuestions.value.some((item) => item.departmentSlug === department.slug))
    .map((department) => ({ value: department.slug, label: department.shortName || department.name, count: departmentQuestions.value.filter((item) => item.departmentSlug === department.slug).length }))
  return [
    { value: 'all', label: 'All questions', count: allQuestions.value.length },
    { value: 'general', label: 'General information', count: generalQuestions.length },
    ...departments,
  ]
})
const filteredQuestions = computed(() => {
  const search = query.value.trim().toLowerCase()
  return allQuestions.value.filter((item) => {
    if (selectedGroup.value !== 'all' && item.group !== selectedGroup.value) return false
    if (!search) return true
    return `${item.sectionTitle || ''} ${item.question} ${item.answer} ${item.departmentName}`.toLowerCase().includes(search)
  })
})
const groupedQuestions = computed(() => {
  const groups = []
  filteredQuestions.value.forEach((item) => {
    let group = groups.find((entry) => entry.id === item.group)
    if (!group) {
      group = { id: item.group, name: item.departmentName, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  })
  return groups
})
const resultLabel = computed(() => `${filteredQuestions.value.length} ${filteredQuestions.value.length === 1 ? 'answer' : 'answers'}`)
const resetFilters = () => { query.value = ''; selectedGroup.value = 'all' }
</script>

<template>
  <div class="faq-page">
    <PageIntro
      eyebrow="Help and guidance"
      title="Frequently asked questions"
      description="Search the answers collected so far and go directly to the municipal department responsible for each service."
    />

    <main class="faq-directory">
      <div class="site-container">
        <section class="faq-search" aria-labelledby="faq-search-heading">
          <div class="faq-search__intro">
            <p class="section-kicker">Public answer directory</p>
            <h2 id="faq-search-heading">Find the guidance you need</h2>
            <p>Answers published by departments appear here automatically, so residents have one place to search current municipal guidance.</p>
          </div>
          <label class="faq-search__field">
            <span class="sr-only">Search frequently asked questions</span>
            <PhMagnifyingGlass :size="22" aria-hidden="true" />
            <input v-model="query" type="search" placeholder="Search services, requirements or departments" autocomplete="off" />
            <button v-if="query" type="button" aria-label="Clear FAQ search" @click="query = ''"><PhX :size="18" /></button>
          </label>
          <div class="faq-search__summary" aria-live="polite"><strong>{{ resultLabel }}</strong><span>from {{ allQuestions.length }} published questions</span></div>
        </section>

        <nav class="faq-filters" aria-label="Filter questions by department">
          <button
            v-for="option in groupOptions"
            :key="option.value"
            type="button"
            :class="{ 'is-active': selectedGroup === option.value }"
            :aria-pressed="selectedGroup === option.value"
            @click="selectedGroup = option.value"
          >
            <span>{{ option.label }}</span><strong>{{ option.count }}</strong>
          </button>
        </nav>

        <div class="faq-layout">
          <aside class="faq-help">
            <PhChatCircleText :size="34" weight="duotone" />
            <p>Still need help?</p>
            <h2>Let the council direct your enquiry.</h2>
            <span>If an answer is not yet published, contact the help desk and ask for the responsible department.</span>
            <RouterLink to="/contact#e8ebf0ck">Contact the help desk <PhArrowRight :size="17" weight="bold" /></RouterLink>
          </aside>

          <div v-if="groupedQuestions.length" class="faq-results">
            <section v-for="group in groupedQuestions" :key="group.id" class="faq-group" :aria-labelledby="`faq-group-${group.id}`">
              <header><p>{{ group.id === 'general' ? 'Website guidance' : 'Municipal department' }}</p><h2 :id="`faq-group-${group.id}`">{{ group.name }}</h2><span>{{ group.items.length }} {{ group.items.length === 1 ? 'question' : 'questions' }}</span></header>
              <template v-for="(item, index) in group.items" :key="`${item.group}-${item.id}`">
                <h3 v-if="item.sectionTitle && (index === 0 || group.items[index - 1].sectionTitle !== item.sectionTitle)" class="faq-answer__section">{{ item.sectionTitle }}</h3>
                <article class="faq-answer">
                  <span>{{ String(index + 1).padStart(2, '0') }}</span>
                  <div><h3>{{ item.question }}</h3><p>{{ item.answer }}</p><RouterLink :to="item.to">{{ item.link }} <PhArrowRight :size="16" weight="bold" /></RouterLink></div>
                </article>
              </template>
            </section>
          </div>

          <section v-else class="faq-empty" aria-live="polite">
            <PhMagnifyingGlass :size="34" />
            <h2>No published answer matches your search</h2>
            <p>Try a shorter phrase, choose another department or contact the council help desk.</p>
            <button type="button" @click="resetFilters">Show all questions</button>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.faq-page { background: #fff; }
.faq-directory { padding-block: clamp(3.5rem, 7vw, 7rem) 8rem; }
.faq-search { display: grid; grid-template-columns: minmax(0, 1fr) minmax(20rem, .8fr); gap: 2.5rem 5rem; align-items: end; border-bottom: 1px solid rgb(23 35 58 / .14); padding-bottom: 2.5rem; }
.faq-search__intro h2 { max-width: 42rem; margin-top: .65rem; font-size: clamp(2.2rem, 4vw, 4rem); font-weight: 850; letter-spacing: -.055em; line-height: 1.02; text-wrap: balance; }
.faq-search__intro > p:last-child { max-width: 43rem; margin-top: 1.2rem; color: rgb(21 27 38 / .62); font-size: .9rem; line-height: 1.8; }
.faq-search__field { display: grid; min-height: 4rem; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .8rem; border-bottom: 2px solid #17233a; padding-inline: .25rem; color: #8f3f48; }
.faq-search__field input { width: 100%; min-width: 0; border: 0; background: transparent; color: #17233a; font: inherit; font-size: .9rem; outline: 0; }
.faq-search__field input::placeholder { color: rgb(21 27 38 / .46); }
.faq-search__field:focus-within { border-color: #8f3f48; box-shadow: 0 3px 0 rgb(143 63 72 / .12); }
.faq-search__field button { display: grid; width: 2.4rem; height: 2.4rem; place-items: center; color: #596477; transition: color 180ms, background-color 180ms; }.faq-search__field button:hover { background: #f3e9e9; color: #8f3f48; }
.faq-search__summary { grid-column: 2; display: flex; justify-content: space-between; gap: 1rem; margin-top: -1.65rem; color: rgb(21 27 38 / .48); font-size: .68rem; }.faq-search__summary strong { color: #8f3f48; font-variant-numeric: tabular-nums; }
.faq-filters { display: flex; gap: .55rem; overflow-x: auto; padding-block: 1.6rem; scrollbar-width: thin; }
.faq-filters button { display: flex; min-height: 2.9rem; flex: none; align-items: center; gap: .7rem; border: 1px solid rgb(23 35 58 / .14); padding: .65rem .8rem; color: rgb(21 27 38 / .66); font-size: .69rem; font-weight: 760; transition: border-color 180ms, background-color 180ms, color 180ms, transform 180ms; }
.faq-filters button strong { display: grid; min-width: 1.55rem; height: 1.55rem; place-items: center; background: #edf0f4; color: #596477; font-size: .6rem; font-variant-numeric: tabular-nums; }
.faq-filters button:hover { border-color: #8f3f48; color: #8f3f48; transform: translateY(-1px); }.faq-filters button:active { transform: translateY(1px); }.faq-filters button.is-active { border-color: #17233a; background: #17233a; color: white; }.faq-filters button.is-active strong { background: #8f3f48; color: white; }
.faq-layout { display: grid; grid-template-columns: 18rem minmax(0, 1fr); gap: clamp(2.5rem, 6vw, 6.5rem); align-items: start; margin-top: 2.2rem; }
.faq-help { position: sticky; top: calc(var(--site-header-height, 0px) + 2rem); background: #f0f2f5; padding: 1.6rem; }.faq-help > svg { color: #8f3f48; }.faq-help > p { margin-top: 2rem; color: #8f3f48; font-size: .65rem; font-weight: 820; letter-spacing: .08em; text-transform: uppercase; }.faq-help h2 { max-width: 15rem; margin-top: .7rem; font-size: 1.35rem; font-weight: 830; letter-spacing: -.035em; line-height: 1.18; }.faq-help > span { display: block; margin-top: 1rem; color: rgb(21 27 38 / .62); font-size: .75rem; line-height: 1.7; }.faq-help a { display: flex; align-items: center; justify-content: space-between; gap: .6rem; margin-top: 1.6rem; border-top: 1px solid rgb(23 35 58 / .14); padding-top: 1rem; color: #71323a; font-size: .72rem; font-weight: 800; }
.faq-results { min-width: 0; }.faq-group + .faq-group { margin-top: 5rem; }.faq-group > header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: .4rem 2rem; border-bottom: 2px solid #17233a; padding-bottom: 1rem; }.faq-group > header p { grid-column: 1 / -1; color: #8f3f48; font-size: .62rem; font-weight: 830; letter-spacing: .1em; text-transform: uppercase; }.faq-group > header h2 { font-size: clamp(1.55rem, 3vw, 2.35rem); font-weight: 840; letter-spacing: -.045em; line-height: 1.05; }.faq-group > header span { color: rgb(21 27 38 / .48); font-size: .68rem; font-weight: 700; white-space: nowrap; }
.faq-answer__section { margin-top: 2.5rem; border-left: 3px solid #8f3f48; background: #f3f5f8; padding: 1.2rem 1.35rem; color: #17233a; font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 850; letter-spacing: -.02em; line-height: 1.45; white-space: pre-line; }.faq-answer { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: 1rem; border-bottom: 1px solid rgb(23 35 58 / .13); padding-block: 2rem; }.faq-answer > span { padding-top: .2rem; color: #8f3f48; font-family: ui-monospace, monospace; font-size: .7rem; font-weight: 850; font-variant-numeric: tabular-nums; }.faq-answer h3 { max-width: 46rem; font-size: clamp(1.05rem, 2vw, 1.3rem); font-weight: 800; letter-spacing: -.025em; line-height: 1.35; text-wrap: pretty; }.faq-answer p { max-width: 51rem; margin-top: .8rem; color: rgb(21 27 38 / .65); font-size: .87rem; line-height: 1.85; white-space: pre-line; }.faq-answer a { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1rem; color: #71323a; font-size: .7rem; font-weight: 800; transition: gap 180ms, color 180ms; }.faq-answer a:hover { gap: .7rem; color: #8f3f48; }
.faq-empty { min-height: 24rem; border: 1px dashed rgb(23 35 58 / .2); background: #f5f6f8; padding: clamp(2rem, 6vw, 5rem); text-align: center; }.faq-empty svg { color: #8f3f48; }.faq-empty h2 { margin-top: 1.2rem; font-size: 1.55rem; font-weight: 820; }.faq-empty p { max-width: 32rem; margin: .8rem auto 0; color: rgb(21 27 38 / .6); font-size: .84rem; line-height: 1.7; }.faq-empty button { margin-top: 1.5rem; background: #17233a; padding: .8rem 1rem; color: white; font-size: .72rem; font-weight: 800; }
@media (max-width: 900px) { .faq-search { grid-template-columns: 1fr; gap: 2rem; }.faq-search__summary { grid-column: auto; margin-top: -1rem; }.faq-layout { grid-template-columns: 1fr; }.faq-help { position: static; display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 1rem; }.faq-help > svg { grid-row: 1 / 5; }.faq-help > p { margin-top: 0; }.faq-help h2 { max-width: 30rem; }.faq-help > span,.faq-help a { grid-column: 2; }.faq-help a { max-width: 22rem; } }
@media (max-width: 560px) { .faq-directory { padding-block: 3rem 5rem; }.faq-search__intro h2 { font-size: 2.3rem; }.faq-search__summary { align-items: flex-start; flex-direction: column; gap: .2rem; }.faq-layout { margin-top: 1rem; }.faq-help { display: block; }.faq-help > p { margin-top: 1.5rem; }.faq-help a { max-width: none; }.faq-group + .faq-group { margin-top: 3.5rem; }.faq-group > header { align-items: start; }.faq-answer { grid-template-columns: 1.8rem minmax(0, 1fr); padding-block: 1.6rem; } }
</style>
