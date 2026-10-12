<script setup>
import { PhPlus, PhTrash } from '@phosphor-icons/vue'

const contracts = defineModel('contracts', { type: Array, default: () => [] })
const updates = defineModel('updates', { type: Array, default: () => [] })
const addContract = () => contracts.value.push({ id: crypto.randomUUID(), name: '', works: [], contractor: '', start: '', plannedCompletion: '', contractSumUgx: null, sourceContractSum: '', reviewNotes: [] })
const addWork = (contract) => contract.works.push({ name: '', length: '' })
const addUpdate = () => updates.value.push({ id: crypto.randomUUID(), topic: '', planned: '', implemented: '', reviewNotes: [] })
</script>

<template>
  <section class="project-editor" aria-label="Project contract packages">
    <header><div><strong>Contract packages</strong><p>Each road or drainage work remains separately editable.</p></div><button type="button" @click="addContract"><PhPlus :size="16" /> Add package</button></header>
    <article v-for="(contract, index) in contracts" :key="contract.id || index">
      <div class="grid"><label><span>Package</span><input v-model="contract.name" /></label><label><span>Contractor</span><input v-model="contract.contractor" /></label><label><span>Start</span><input v-model="contract.start" /></label><label><span>Planned completion</span><input v-model="contract.plannedCompletion" /></label><label><span>Contract sum (UGX)</span><input v-model.number="contract.contractSumUgx" type="number" min="0" /></label><label><span>Original source value</span><input v-model="contract.sourceContractSum" /></label></div>
      <div class="works"><div v-for="(work, workIndex) in contract.works" :key="workIndex"><input v-model="work.name" placeholder="Road or work" /><input v-model="work.length" placeholder="Length" /><button type="button" aria-label="Remove work" @click="contract.works.splice(workIndex, 1)"><PhTrash /></button></div><button type="button" @click="addWork(contract)"><PhPlus :size="15" /> Add work</button></div>
      <label><span>Internal review notes</span><textarea :value="(contract.reviewNotes || []).join('\n')" rows="2" @input="contract.reviewNotes = $event.target.value.split('\n').filter(Boolean)"></textarea></label>
      <button class="remove" type="button" @click="contracts.splice(index, 1)"><PhTrash :size="15" /> Remove package</button>
    </article>
  </section>
  <section class="project-editor" aria-label="Project implementation report">
    <header><div><strong>Implementation report</strong><p>Keep planned and implemented statements separate.</p></div><button type="button" @click="addUpdate"><PhPlus :size="16" /> Add activity</button></header>
    <article v-for="(update, index) in updates" :key="update.id || index"><label><span>Activity</span><input v-model="update.topic" /></label><div class="grid"><label><span>Planned activity</span><textarea v-model="update.planned" rows="4"></textarea></label><label><span>Implemented activity</span><textarea v-model="update.implemented" rows="4"></textarea></label></div><label><span>Internal review notes</span><textarea :value="(update.reviewNotes || []).join('\n')" rows="2" @input="update.reviewNotes = $event.target.value.split('\n').filter(Boolean)"></textarea></label><button class="remove" type="button" @click="updates.splice(index, 1)"><PhTrash :size="15" /> Remove activity</button></article>
  </section>
</template>

<style scoped>
.project-editor{display:grid;grid-column:1/-1;gap:.8rem;border:1px solid rgb(7 59 44/.12);background:#f8faf6;padding:1rem}.project-editor>header{display:flex;align-items:center;justify-content:space-between;gap:1rem}.project-editor header strong{font-size:.8rem}.project-editor header p{margin-top:.2rem;color:#68766e;font-size:.62rem}.project-editor button{display:inline-flex;align-items:center;gap:.35rem;border:1px solid rgb(7 59 44/.18);padding:.5rem .65rem;color:#073b2c;font-size:.62rem;font-weight:800}.project-editor article{display:grid;gap:.75rem;background:white;padding:.9rem}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}.works{display:grid;gap:.45rem}.works>div{display:grid;grid-template-columns:1fr 8rem auto;gap:.45rem}.project-editor input,.project-editor textarea{width:100%;border:1px solid rgb(7 59 44/.16);background:#fbfcfa;padding:.65rem;font-size:.68rem}.remove{justify-self:start;color:#973737!important}@media(max-width:640px){.grid,.works>div{grid-template-columns:1fr}}
</style>
