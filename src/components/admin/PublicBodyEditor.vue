<script setup>
import { computed } from 'vue'
import { PhFilePdf, PhPlus, PhTrash, PhUsersThree } from '@phosphor-icons/vue'

const model = defineModel({ type: Object, required: true })
const bodies = computed(() => Array.isArray(model.value.publicBodies) ? model.value.publicBodies : [])
const makeId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`
const ensureBodies = () => { if (!Array.isArray(model.value.publicBodies)) model.value.publicBodies = [] }
const addBody = () => {
  ensureBodies()
  model.value.publicBodies.push({ id: makeId('public-body'), name: '', acronym: '', summary: '', purpose: '', sourceTitle: '', lastReviewed: '', documentUrl: '', documentFileName: '' })
}
const removeBody = (index) => model.value.publicBodies.splice(index, 1)
</script>

<template>
  <section class="public-body-editor" aria-labelledby="public-body-editor-title">
    <header>
      <div><p>Community representation</p><h3 id="public-body-editor-title">Public forums and committees</h3><small>Describe the forum here, then link its approved member-directory PDF from the Municipal Notice Board.</small></div>
      <button v-if="!bodies.length" type="button" @click="addBody"><PhPlus :size="16" /> Add public forum</button>
    </header>

    <article v-for="(body, bodyIndex) in bodies" :key="body.id || bodyIndex" class="public-body-editor__body">
      <div class="public-body-editor__body-heading"><span><PhUsersThree :size="20" /><strong>{{ body.name || `Public forum ${bodyIndex + 1}` }}</strong></span><button type="button" :aria-label="`Remove ${body.name || 'public forum'}`" @click="removeBody(bodyIndex)"><PhTrash :size="16" /> Remove forum</button></div>
      <div class="public-body-editor__fields">
        <label><span>Forum name <b>Required</b></span><input v-model="body.name" required /></label>
        <label><span>Acronym</span><input v-model="body.acronym" /></label>
        <label class="is-wide"><span>Public summary <b>Required</b></span><textarea v-model="body.summary" rows="3" required></textarea></label>
        <label class="is-wide"><span>Purpose and responsibilities <b>Required</b></span><textarea v-model="body.purpose" rows="4" required></textarea></label>
        <label><span>Source title</span><input v-model="body.sourceTitle" /></label>
        <label><span>Last confirmed</span><input v-model="body.lastReviewed" type="date" /></label>
        <label class="is-wide"><span>Notice Board PDF link <b>Required to publish</b></span><input v-model="body.documentUrl" placeholder="Paste the URL from Notice board documents" required /></label>
        <label class="is-wide"><span>Download file name</span><input v-model="body.documentFileName" placeholder="for example, mdf-member-directory.pdf" /></label>
      </div>
      <div class="public-body-editor__document"><PhFilePdf :size="24" /><div><strong>Member names belong in the approved PDF</strong><p>The website now displays a single official download instead of a long public list. Upload the PDF under Notice board documents, then paste its link above.</p></div></div>
    </article>
  </section>
</template>

<style scoped>
.public-body-editor { grid-column: 1 / -1; display: grid; gap: 1rem; border-top: 4px solid #8f3f48; background: #f5f2f2; padding: 1.2rem; }.public-body-editor > header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }.public-body-editor > header p { color: #8f3f48; font-size: .58rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.public-body-editor h3 { margin-top: .25rem; font-size: 1rem; }.public-body-editor > header small { display: block; max-width: 34rem; margin-top: .35rem; color: #66736c; font-size: .62rem; line-height: 1.55; }.public-body-editor button { display: inline-flex; min-height: 2.3rem; align-items: center; justify-content: center; gap: .35rem; border: 1px solid rgb(23 35 58 / .16); background: white; padding: .5rem .7rem; color: #71323a; font-size: .6rem; font-weight: 800; }.public-body-editor button:hover:not(:disabled) { border-color: #8f3f48; color: #8f3f48; }.public-body-editor button:disabled { opacity: .3; }
.public-body-editor__body { background: white; padding: 1rem; }.public-body-editor__body-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgb(23 35 58 / .1); padding-bottom: .8rem; }.public-body-editor__body-heading > span { display: flex; align-items: center; gap: .5rem; }.public-body-editor__body-heading > span svg { color: #8f3f48; }.public-body-editor__body-heading > button { color: #943c3c; }
.public-body-editor__fields { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: 1rem; }.public-body-editor__fields .is-wide { grid-column: 1 / -1; }.public-body-editor label > span { display: flex; justify-content: space-between; margin-bottom: .4rem; font-size: .61rem; font-weight: 800; }.public-body-editor label b { color: #8f3f48; font-size: .48rem; letter-spacing: .07em; text-transform: uppercase; }.public-body-editor input,.public-body-editor textarea { width: 100%; border: 1px solid rgb(23 35 58 / .15); background: #fbfbfa; padding: .7rem .75rem; font: inherit; font-size: .7rem; }.public-body-editor input { min-height: 2.8rem; }.public-body-editor textarea { resize: vertical; line-height: 1.55; }.public-body-editor input:focus,.public-body-editor textarea:focus { border-color: #8f3f48; outline: 0; box-shadow: 0 0 0 3px rgb(143 63 72 / .1); }
.public-body-editor__document { display: flex; align-items: flex-start; gap: .8rem; margin-top: 1rem; background: #f5f2f2; padding: 1rem; color: #71323a; }.public-body-editor__document svg { flex: none; }.public-body-editor__document strong { font-size: .72rem; }.public-body-editor__document p { margin-top: .25rem; color: #66736c; font-size: .62rem; line-height: 1.6; }
@media (max-width: 760px) { .public-body-editor > header,.public-body-editor__body-heading { align-items: stretch; flex-direction: column; }.public-body-editor > header button { align-self: start; }.public-body-editor__fields { grid-template-columns: 1fr; }.public-body-editor__fields .is-wide { grid-column: auto; } }
</style>
