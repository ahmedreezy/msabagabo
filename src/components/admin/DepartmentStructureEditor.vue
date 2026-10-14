<script setup>
import { PhArrowDown, PhArrowUp, PhPlus, PhTrash } from '@phosphor-icons/vue'

const model = defineModel({ type: Object, required: true })
const id = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}`
const ensure = (key) => { if (!Array.isArray(model.value[key])) model.value[key] = [] }

const addSector = () => { ensure('sectors'); model.value.sectors.push({ id: id('sector'), name: '', summary: '' }) }
const addFaq = () => { ensure('faqs'); model.value.faqs.push({ id: id('faq'), question: '', answer: '', sectorId: '' }) }
const remove = (key, index) => { model.value[key].splice(index, 1) }
const move = (key, index, offset) => {
  const target = index + offset
  if (target < 0 || target >= model.value[key].length) return
  const [item] = model.value[key].splice(index, 1)
  model.value[key].splice(target, 0, item)
}
</script>

<template>
  <section class="structured-editor" aria-labelledby="department-structure-title">
    <header>
      <div><p>Required public order</p><h3 id="department-structure-title">Sectors and frequently asked questions</h3></div>
      <small>These appear after the mandate on the public department page.</small>
    </header>

    <div class="structured-editor__group">
      <div class="structured-editor__group-heading"><div><h4>Sectors under the department</h4><p>Add the official sections, units or sectors in display order.</p></div><button type="button" @click="addSector"><PhPlus :size="16" /> Add sector</button></div>
      <p v-if="!model.sectors?.length" class="structured-editor__empty">No sectors have been added. Older “units” content will remain visible until sectors are added.</p>
      <article v-for="(sector, index) in model.sectors" :key="sector.id || index" class="structured-editor__entry">
        <div class="structured-editor__entry-heading"><strong>Sector {{ index + 1 }}</strong><span><button type="button" :disabled="index === 0" :aria-label="`Move ${sector.name || 'sector'} up`" @click="move('sectors', index, -1)"><PhArrowUp :size="15" /></button><button type="button" :disabled="index === model.sectors.length - 1" :aria-label="`Move ${sector.name || 'sector'} down`" @click="move('sectors', index, 1)"><PhArrowDown :size="15" /></button><button type="button" :aria-label="`Remove ${sector.name || 'sector'}`" @click="remove('sectors', index)"><PhTrash :size="15" /></button></span></div>
        <label><span>Sector name <b>Required</b></span><input v-model="sector.name" type="text" required /></label>
        <label><span>Short description</span><textarea v-model="sector.summary" rows="2"></textarea></label>
      </article>
    </div>

    <div class="structured-editor__group">
      <div class="structured-editor__group-heading"><div><h4>Frequently asked questions</h4><p>Write the public question in plain language and provide the approved answer.</p></div><button type="button" @click="addFaq"><PhPlus :size="16" /> Add question</button></div>
      <p v-if="!model.faqs?.length" class="structured-editor__empty">No departmental questions have been added. The public page will show a contact route instead.</p>
      <article v-for="(faq, index) in model.faqs" :key="faq.id || index" class="structured-editor__entry">
        <div class="structured-editor__entry-heading"><strong>Question {{ index + 1 }}</strong><span><button type="button" :disabled="index === 0" :aria-label="`Move question ${index + 1} up`" @click="move('faqs', index, -1)"><PhArrowUp :size="15" /></button><button type="button" :disabled="index === model.faqs.length - 1" :aria-label="`Move question ${index + 1} down`" @click="move('faqs', index, 1)"><PhArrowDown :size="15" /></button><button type="button" :aria-label="`Remove question ${index + 1}`" @click="remove('faqs', index)"><PhTrash :size="15" /></button></span></div>
        <label><span>Question <b>Required</b></span><input v-model="faq.question" type="text" required /></label>
        <label><span>Approved answer <b>Required</b></span><textarea v-model="faq.answer" rows="5" required></textarea></label>
        <label v-if="model.sectors?.length"><span>Related sector</span><select v-model="faq.sectorId"><option value="">Whole department</option><option v-for="sector in model.sectors.filter((item) => item.name)" :key="sector.id" :value="sector.id">{{ sector.name }}</option></select></label>
      </article>
    </div>
  </section>
</template>

<style scoped>
.structured-editor { grid-column: 1 / -1; display: grid; gap: 1.5rem; border-top: 4px solid #8b6719; background: #f4f6f2; padding: 1.2rem; }
.structured-editor > header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .55fr); gap: 1rem; align-items: end; }
.structured-editor > header p { color: #8b6719; font-size: .58rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }
.structured-editor h3 { margin-top: .25rem; font-size: 1rem; }
.structured-editor > header small,.structured-editor__group-heading p { color: #66736c; font-size: .62rem; line-height: 1.6; }
.structured-editor__group { display: grid; gap: .8rem; }
.structured-editor__group-heading { display: flex; gap: 1rem; align-items: end; justify-content: space-between; }
.structured-editor__group-heading h4 { font-size: .8rem; }
.structured-editor button { display: inline-flex; min-height: 2.3rem; align-items: center; justify-content: center; gap: .35rem; border: 1px solid rgb(7 59 44 / .18); background: white; padding: .5rem .7rem; color: #073b2c; font-size: .6rem; font-weight: 800; }
.structured-editor button:hover:not(:disabled) { border-color: #8b6719; color: #8b6719; }
.structured-editor button:disabled { opacity: .35; }
.structured-editor__empty { border: 1px dashed rgb(7 59 44 / .2); padding: 1rem; color: #66736c; font-size: .65rem; }
.structured-editor__entry { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: .8rem; border-left: 3px solid #d6ded8; background: white; padding: 1rem; }
.structured-editor__entry-heading { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
.structured-editor__entry-heading strong { font-size: .67rem; }
.structured-editor__entry-heading span { display: flex; gap: .3rem; }
.structured-editor__entry-heading button { width: 2.2rem; padding: 0; }
.structured-editor__entry label:last-child:nth-child(3) { grid-column: 1 / -1; }
.structured-editor label > span { display: flex; align-items: center; justify-content: space-between; margin-bottom: .45rem; font-size: .62rem; font-weight: 800; }.structured-editor label b { color: #8b6719; font-size: .49rem; letter-spacing: .08em; text-transform: uppercase; }.structured-editor input,.structured-editor textarea,.structured-editor select { width: 100%; border: 1px solid rgb(7 59 44 / .16); background: #fbfcfa; padding: .72rem .8rem; font: inherit; font-size: .7rem; }.structured-editor input,.structured-editor select { min-height: 2.9rem; }.structured-editor textarea { resize: vertical; line-height: 1.55; }.structured-editor input:focus,.structured-editor textarea:focus,.structured-editor select:focus { border-color: #8b6719; outline: 0; box-shadow: 0 0 0 3px rgb(139 103 25 / .1); }
@media (max-width: 700px) { .structured-editor > header,.structured-editor__entry { grid-template-columns: 1fr; }.structured-editor__entry > * { grid-column: auto !important; }.structured-editor__group-heading { align-items: stretch; flex-direction: column; }.structured-editor__group-heading button { align-self: start; } }
</style>
