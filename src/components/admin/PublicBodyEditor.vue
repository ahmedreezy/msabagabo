<script setup>
import { computed } from 'vue'
import { PhArrowDown, PhArrowUp, PhPlus, PhTrash, PhUsersThree } from '@phosphor-icons/vue'

const model = defineModel({ type: Object, required: true })
const bodies = computed(() => Array.isArray(model.value.publicBodies) ? model.value.publicBodies : [])
const makeId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`
const ensureBodies = () => { if (!Array.isArray(model.value.publicBodies)) model.value.publicBodies = [] }
const addBody = () => {
  ensureBodies()
  model.value.publicBodies.push({ id: makeId('public-body'), name: '', acronym: '', summary: '', purpose: '', sourceTitle: '', lastReviewed: '', members: [] })
}
const removeBody = (index) => model.value.publicBodies.splice(index, 1)
const ensureMembers = (body) => { if (!Array.isArray(body.members)) body.members = [] }
const addMember = (body) => { ensureMembers(body); body.members.push({ id: makeId('member'), name: '', category: '' }) }
const removeMember = (body, index) => body.members.splice(index, 1)
const moveMember = (body, index, offset) => {
  const target = index + offset
  if (target < 0 || target >= body.members.length) return
  const [member] = body.members.splice(index, 1)
  body.members.splice(target, 0, member)
}
</script>

<template>
  <section class="public-body-editor" aria-labelledby="public-body-editor-title">
    <header>
      <div><p>Community representation</p><h3 id="public-body-editor-title">Public forums and committees</h3><small>Manage the confirmed Metropolitan Development Forum information shown under Community-Based Services.</small></div>
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
      </div>

      <section class="public-body-editor__members" :aria-label="`${body.name || 'Public forum'} members`">
        <div class="public-body-editor__members-heading"><div><h4>Confirmed members</h4><p>{{ body.members?.length || 0 }} listed representatives</p></div><button type="button" @click="addMember(body)"><PhPlus :size="16" /> Add member</button></div>
        <p v-if="!body.members?.length" class="public-body-editor__empty">No confirmed members have been added.</p>
        <article v-for="(member, index) in body.members" v-else :key="member.id || index" class="public-body-editor__member">
          <strong>{{ String(index + 1).padStart(2, '0') }}</strong>
          <label><span>Member name <b>Required</b></span><input v-model="member.name" required /></label>
          <label><span>Represented category <b>Required</b></span><input v-model="member.category" required /></label>
          <div><button type="button" :disabled="index === 0" :aria-label="`Move ${member.name || 'member'} up`" @click="moveMember(body, index, -1)"><PhArrowUp :size="15" /></button><button type="button" :disabled="index === body.members.length - 1" :aria-label="`Move ${member.name || 'member'} down`" @click="moveMember(body, index, 1)"><PhArrowDown :size="15" /></button><button type="button" :aria-label="`Remove ${member.name || 'member'}`" @click="removeMember(body, index)"><PhTrash :size="15" /></button></div>
        </article>
      </section>
    </article>
  </section>
</template>

<style scoped>
.public-body-editor { grid-column: 1 / -1; display: grid; gap: 1rem; border-top: 4px solid #8f3f48; background: #f5f2f2; padding: 1.2rem; }.public-body-editor > header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }.public-body-editor > header p { color: #8f3f48; font-size: .58rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.public-body-editor h3 { margin-top: .25rem; font-size: 1rem; }.public-body-editor > header small { display: block; max-width: 34rem; margin-top: .35rem; color: #66736c; font-size: .62rem; line-height: 1.55; }.public-body-editor button { display: inline-flex; min-height: 2.3rem; align-items: center; justify-content: center; gap: .35rem; border: 1px solid rgb(23 35 58 / .16); background: white; padding: .5rem .7rem; color: #71323a; font-size: .6rem; font-weight: 800; }.public-body-editor button:hover:not(:disabled) { border-color: #8f3f48; color: #8f3f48; }.public-body-editor button:disabled { opacity: .3; }
.public-body-editor__body { background: white; padding: 1rem; }.public-body-editor__body-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgb(23 35 58 / .1); padding-bottom: .8rem; }.public-body-editor__body-heading > span { display: flex; align-items: center; gap: .5rem; }.public-body-editor__body-heading > span svg { color: #8f3f48; }.public-body-editor__body-heading > button { color: #943c3c; }
.public-body-editor__fields { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: 1rem; }.public-body-editor__fields .is-wide { grid-column: 1 / -1; }.public-body-editor label > span { display: flex; justify-content: space-between; margin-bottom: .4rem; font-size: .61rem; font-weight: 800; }.public-body-editor label b { color: #8f3f48; font-size: .48rem; letter-spacing: .07em; text-transform: uppercase; }.public-body-editor input,.public-body-editor textarea { width: 100%; border: 1px solid rgb(23 35 58 / .15); background: #fbfbfa; padding: .7rem .75rem; font: inherit; font-size: .7rem; }.public-body-editor input { min-height: 2.8rem; }.public-body-editor textarea { resize: vertical; line-height: 1.55; }.public-body-editor input:focus,.public-body-editor textarea:focus { border-color: #8f3f48; outline: 0; box-shadow: 0 0 0 3px rgb(143 63 72 / .1); }
.public-body-editor__members { margin-top: 1.5rem; }.public-body-editor__members-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }.public-body-editor__members-heading h4 { font-size: .8rem; }.public-body-editor__members-heading p { margin-top: .2rem; color: #69756f; font-size: .58rem; }.public-body-editor__empty { margin-top: .8rem; border: 1px dashed rgb(23 35 58 / .18); padding: 1rem; color: #6b756f; font-size: .65rem; }
.public-body-editor__member { display: grid; grid-template-columns: 2rem minmax(0, .85fr) minmax(0, 1.15fr) auto; gap: .7rem; align-items: end; border-top: 1px solid rgb(23 35 58 / .1); padding-block: .8rem; }.public-body-editor__member > strong { align-self: center; color: #8f3f48; font-family: ui-monospace, monospace; font-size: .62rem; }.public-body-editor__member > div { display: flex; gap: .25rem; }.public-body-editor__member > div button { width: 2.25rem; padding: 0; }
@media (max-width: 760px) { .public-body-editor > header,.public-body-editor__body-heading,.public-body-editor__members-heading { align-items: stretch; flex-direction: column; }.public-body-editor > header button,.public-body-editor__members-heading button { align-self: start; }.public-body-editor__fields { grid-template-columns: 1fr; }.public-body-editor__fields .is-wide { grid-column: auto; }.public-body-editor__member { grid-template-columns: 1.8rem minmax(0, 1fr); }.public-body-editor__member > label { grid-column: 2; }.public-body-editor__member > div { grid-column: 2; } }
</style>
