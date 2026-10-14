<script setup>
import { PhArrowDown, PhArrowUp, PhPlus, PhTrash } from '@phosphor-icons/vue'

const model = defineModel({ type: Object, required: true })
const id = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}`
const ensure = (key) => { if (!Array.isArray(model.value[key])) model.value[key] = [] }
const add = (key) => {
  ensure(key)
  if (key === 'contracts') model.value[key].push({ id: id('contract'), lot: '', works: '', contractor: '', startDate: '', completionDate: '', contractSum: '', status: '' })
  else model.value[key].push({ id: id('activity'), planned: '', implemented: '', status: '' })
}
const remove = (key, index) => model.value[key].splice(index, 1)
const move = (key, index, offset) => {
  const target = index + offset
  if (target < 0 || target >= model.value[key].length) return
  const [item] = model.value[key].splice(index, 1)
  model.value[key].splice(target, 0, item)
}
</script>

<template>
  <section v-if="model.recordType === 'Programme'" class="programme-editor" aria-label="Programme delivery details">
    <header><div><p>Programme delivery</p><h3>Contracts and implementation progress</h3></div><small>These structured records power the public programme tables and mobile cards.</small></header>
    <div class="programme-editor__group">
      <div class="programme-editor__heading"><div><h4>Capital works and contracts</h4><p>Use one record for each lot, drainage contract or other capital package.</p></div><button type="button" @click="add('contracts')"><PhPlus :size="16" /> Add contract</button></div>
      <p v-if="!model.contracts?.length" class="programme-editor__empty">No contracts added.</p>
      <article v-for="(contract, index) in model.contracts" :key="contract.id || index" class="programme-editor__entry">
        <div class="programme-editor__entry-heading"><strong>Contract {{ index + 1 }}</strong><span><button type="button" :disabled="index === 0" @click="move('contracts', index, -1)"><PhArrowUp :size="15" /></button><button type="button" :disabled="index === model.contracts.length - 1" @click="move('contracts', index, 1)"><PhArrowDown :size="15" /></button><button type="button" @click="remove('contracts', index)"><PhTrash :size="15" /></button></span></div>
        <label><span>Lot or package <b>Required</b></span><input v-model="contract.lot" required /></label>
        <label><span>Contractor <b>Required</b></span><input v-model="contract.contractor" required /></label>
        <label class="is-wide"><span>Roads or works included <b>Required</b></span><textarea v-model="contract.works" rows="3" required placeholder="One road or work per line"></textarea></label>
        <label><span>Start date</span><input v-model="contract.startDate" type="date" /></label>
        <label><span>Planned completion</span><input v-model="contract.completionDate" type="date" /></label>
        <label><span>Contract sum</span><input v-model="contract.contractSum" placeholder="UGX 37,857,827,188" /></label>
        <label><span>Status</span><input v-model="contract.status" placeholder="In progress" /></label>
      </article>
    </div>
    <div class="programme-editor__group">
      <div class="programme-editor__heading"><div><h4>Institutional-strengthening progress</h4><p>Pair each approved activity with its latest implementation result.</p></div><button type="button" @click="add('activities')"><PhPlus :size="16" /> Add activity</button></div>
      <p v-if="!model.activities?.length" class="programme-editor__empty">No implementation activities added.</p>
      <article v-for="(activity, index) in model.activities" :key="activity.id || index" class="programme-editor__entry programme-editor__entry--activity">
        <div class="programme-editor__entry-heading"><strong>Activity {{ index + 1 }}</strong><span><button type="button" :disabled="index === 0" @click="move('activities', index, -1)"><PhArrowUp :size="15" /></button><button type="button" :disabled="index === model.activities.length - 1" @click="move('activities', index, 1)"><PhArrowDown :size="15" /></button><button type="button" @click="remove('activities', index)"><PhTrash :size="15" /></button></span></div>
        <label><span>Planned activity <b>Required</b></span><textarea v-model="activity.planned" rows="4" required></textarea></label>
        <label><span>Implemented activity or result <b>Required</b></span><textarea v-model="activity.implemented" rows="4" required></textarea></label>
        <label><span>Status</span><input v-model="activity.status" placeholder="Completed, ongoing or rolled over" /></label>
      </article>
    </div>
  </section>
</template>

<style scoped>
.programme-editor { grid-column: 1 / -1; display: grid; gap: 1.5rem; border-top: 4px solid #1f506a; background: #f1f5f7; padding: 1.2rem; }
.programme-editor > header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(12rem, .55fr); gap: 1rem; align-items: end; }
.programme-editor > header p { color: #1f506a; font-size: .58rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }
.programme-editor h3 { margin-top: .25rem; font-size: 1rem; }.programme-editor > header small,.programme-editor__heading p { color: #66737a; font-size: .62rem; line-height: 1.6; }
.programme-editor__group { display: grid; gap: .8rem; }.programme-editor__heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }.programme-editor__heading h4 { font-size: .8rem; }
.programme-editor button { display: inline-flex; min-height: 2.3rem; align-items: center; justify-content: center; gap: .35rem; border: 1px solid rgb(31 80 106 / .2); background: white; padding: .5rem .7rem; color: #1f506a; font-size: .6rem; font-weight: 800; }.programme-editor button:hover:not(:disabled) { border-color: #1f506a; }.programme-editor button:disabled { opacity: .35; }
.programme-editor__empty { border: 1px dashed rgb(31 80 106 / .24); padding: 1rem; color: #66737a; font-size: .65rem; }
.programme-editor__entry { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; border-left: 3px solid #bfd0d8; background: white; padding: 1rem; }.programme-editor__entry-heading { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }.programme-editor__entry-heading strong { font-size: .67rem; }.programme-editor__entry-heading span { display: flex; gap: .3rem; }.programme-editor__entry-heading button { width: 2.2rem; padding: 0; }.programme-editor__entry .is-wide { grid-column: 1 / -1; }
.programme-editor label > span { display: flex; align-items: center; justify-content: space-between; margin-bottom: .45rem; font-size: .62rem; font-weight: 800; }.programme-editor label b { color: #1f506a; font-size: .49rem; letter-spacing: .08em; text-transform: uppercase; }.programme-editor input,.programme-editor textarea { width: 100%; border: 1px solid rgb(31 80 106 / .18); background: #fbfcfd; padding: .72rem .8rem; font: inherit; font-size: .7rem; }.programme-editor input { min-height: 2.9rem; }.programme-editor textarea { resize: vertical; line-height: 1.55; }.programme-editor input:focus,.programme-editor textarea:focus { border-color: #1f506a; outline: 0; box-shadow: 0 0 0 3px rgb(31 80 106 / .1); }
@media (max-width: 700px) { .programme-editor > header,.programme-editor__entry { grid-template-columns: 1fr; }.programme-editor__entry > * { grid-column: auto !important; }.programme-editor__heading { align-items: stretch; flex-direction: column; }.programme-editor__heading button { align-self: start; } }
</style>
