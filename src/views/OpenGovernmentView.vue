<script setup>
import { computed, ref } from 'vue'
import { PhDownloadSimple, PhFilePdf, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const query = ref('')
const category = ref('all')
const publications = computed(() => [...cmsContent.publications].sort((a, b) => Date.parse(b.publishedDate || b.date || '') - Date.parse(a.publishedDate || a.date || '')))
const categories = computed(() => [...new Set(publications.value.map((item) => item.category).filter(Boolean))].sort())
const filteredPublications = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  return publications.value.filter((item) => {
    const matchesCategory = category.value === 'all' || item.category === category.value
    const haystack = [item.title, item.summary, item.category, item.department, item.referenceNumber].filter(Boolean).join(' ').toLocaleLowerCase()
    return matchesCategory && (!term || haystack.includes(term))
  })
})
const downloadableCount = computed(() => publications.value.filter((item) => item.url).length)
const clearFilters = () => { query.value = ''; category.value = 'all' }
</script>

<template>
  <div class="notice-board-page">
    <PageIntro page-key="open-government" eyebrow="Official public records" title="Municipal Notice Board" description="Find and download approved municipal notices, reports, plans, policies, committee records and service documents." prefer-props />
    <section class="notice-board" aria-labelledby="notice-board-heading">
      <div class="site-container">
        <header class="notice-board__heading">
          <div><p class="section-kicker">Document library</p><h2 id="notice-board-heading">Official municipal documents</h2></div>
          <p>{{ downloadableCount }} downloadable {{ downloadableCount === 1 ? 'document' : 'documents' }} currently available</p>
        </header>
        <div class="notice-board__tools">
          <label class="notice-board__search"><span class="sr-only">Search documents</span><PhMagnifyingGlass :size="20" /><input v-model="query" type="search" placeholder="Search by title, department or reference" /><button v-if="query" type="button" aria-label="Clear search" @click="query = ''"><PhX :size="17" /></button></label>
          <label class="notice-board__filter"><span>Document type</span><select v-model="category"><option value="all">All categories</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></label>
        </div>
        <div v-if="filteredPublications.length" class="notice-board__list">
          <article v-for="publication in filteredPublications" :key="`${publication.title}-${publication.referenceNumber || ''}`" class="notice-document">
            <div class="notice-document__icon"><PhFilePdf :size="27" weight="duotone" /><span>{{ publication.format || 'PDF' }}</span></div>
            <div class="notice-document__copy">
              <div class="notice-document__meta"><span>{{ publication.category || 'Municipal document' }}</span><time v-if="publication.publishedDate" :datetime="publication.publishedDate">{{ formatCmsDate(publication.publishedDate) }}</time></div>
              <h3>{{ publication.title }}</h3>
              <p v-if="publication.summary">{{ publication.summary }}</p>
              <dl v-if="publication.department || publication.referenceNumber"><div v-if="publication.department"><dt>Issued by</dt><dd>{{ publication.department }}</dd></div><div v-if="publication.referenceNumber"><dt>Reference</dt><dd>{{ publication.referenceNumber }}</dd></div></dl>
            </div>
            <a v-if="publication.url" class="notice-document__download" :href="publication.url" :download="publication.fileName || undefined" target="_blank" rel="noreferrer"><PhDownloadSimple :size="19" weight="bold" /><span>Download PDF</span></a>
            <span v-else class="notice-document__pending">File pending publication</span>
          </article>
        </div>
        <div v-else class="notice-board__empty"><PhFilePdf :size="34" /><h3>No documents match your search</h3><p>Try another keyword or view every document category.</p><button type="button" @click="clearFilters">Clear filters</button></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.notice-board-page { background: #f4f3ef; }
.notice-board { padding-block: clamp(4rem, 7vw, 7rem); }
.notice-board__heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; border-bottom: 1px solid rgb(23 35 58 / .14); padding-bottom: 1.6rem; }
.notice-board__heading h2 { margin-top: .7rem; color: #17233a; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 820; letter-spacing: -.05em; line-height: 1.06; }
.notice-board__heading > p { max-width: 18rem; color: rgb(23 35 58 / .58); font-size: .78rem; line-height: 1.6; text-align: right; }
.notice-board__tools { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, .35fr); gap: .8rem; margin-block: 1.5rem 2rem; }
.notice-board__search { display: grid; min-height: 3.7rem; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .75rem; border: 1px solid rgb(23 35 58 / .15); background: white; padding-inline: 1rem; color: #8f3f48; }
.notice-board__search input { min-width: 0; border: 0; outline: 0; color: #17233a; font: inherit; font-size: .86rem; }.notice-board__search button { display: grid; width: 2rem; height: 2rem; place-items: center; }
.notice-board__search:focus-within,.notice-board__filter:focus-within { border-color: #8f3f48; box-shadow: 0 0 0 3px rgb(143 63 72 / .1); }
.notice-board__filter { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .75rem; border: 1px solid rgb(23 35 58 / .15); background: white; padding-inline: 1rem; }.notice-board__filter span { color: rgb(23 35 58 / .5); font-size: .65rem; font-weight: 800; }.notice-board__filter select { min-width: 0; border: 0; background: transparent; color: #17233a; font: inherit; font-size: .78rem; font-weight: 700; outline: 0; }
.notice-board__list { border-top: 3px solid #8f3f48; background: white; }
.notice-document { display: grid; grid-template-columns: 5rem minmax(0, 1fr) auto; gap: 1.4rem; align-items: center; border-bottom: 1px solid rgb(23 35 58 / .11); padding: 1.55rem; transition: background-color 220ms ease; }.notice-document:hover { background: #faf9f6; }
.notice-document__icon { display: grid; min-height: 5rem; place-items: center; align-content: center; gap: .35rem; background: #f0e9e9; color: #8f3f48; }.notice-document__icon span { font-size: .55rem; font-weight: 900; letter-spacing: .08em; }
.notice-document__meta { display: flex; flex-wrap: wrap; gap: .5rem 1rem; color: #8f3f48; font-size: .62rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.notice-document h3 { max-width: 52rem; margin-top: .45rem; color: #17233a; font-size: clamp(1rem, 1.6vw, 1.25rem); font-weight: 790; line-height: 1.35; }.notice-document__copy > p { max-width: 55rem; margin-top: .55rem; color: rgb(23 35 58 / .62); font-size: .78rem; line-height: 1.65; }
.notice-document dl { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; margin-top: .8rem; }.notice-document dl div { display: flex; gap: .4rem; font-size: .65rem; }.notice-document dt { color: rgb(23 35 58 / .45); }.notice-document dd { color: #17233a; font-weight: 700; }
.notice-document__download { display: inline-flex; min-height: 2.9rem; align-items: center; justify-content: center; gap: .5rem; background: #17233a; padding: .7rem .9rem; color: white; font-size: .7rem; font-weight: 800; white-space: nowrap; transition: transform 200ms ease, background-color 200ms ease; }.notice-document__download:hover { transform: translateY(-2px); background: #8f3f48; }.notice-document__download:active { transform: translateY(0) scale(.98); }.notice-document__download:focus-visible { outline: 3px solid #b77982; outline-offset: 3px; }.notice-document__pending { color: rgb(23 35 58 / .48); font-size: .68rem; font-weight: 700; }
.notice-board__empty { display: grid; min-height: 20rem; place-items: center; align-content: center; background: white; padding: 2rem; text-align: center; }.notice-board__empty svg { color: #8f3f48; }.notice-board__empty h3 { margin-top: 1rem; font-size: 1.2rem; }.notice-board__empty p { margin-top: .4rem; color: rgb(23 35 58 / .6); font-size: .8rem; }.notice-board__empty button { margin-top: 1rem; color: #8f3f48; font-size: .75rem; font-weight: 800; text-decoration: underline; }
@media (max-width: 760px) { .notice-board__heading { align-items: start; flex-direction: column; }.notice-board__heading > p { text-align: left; }.notice-board__tools { grid-template-columns: 1fr; }.notice-board__filter { min-height: 3.7rem; }.notice-document { grid-template-columns: 3.5rem minmax(0, 1fr); gap: 1rem; padding: 1.1rem; }.notice-document__icon { min-height: 3.8rem; }.notice-document__download,.notice-document__pending { grid-column: 2; justify-self: start; }.notice-document dl { flex-direction: column; gap: .3rem; } }
</style>
