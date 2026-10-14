<script setup>
import { computed, ref } from 'vue'
import { PhMagnifyingGlass, PhUsersThree, PhX } from '@phosphor-icons/vue'

const props = defineProps({ body: { type: Object, required: true } })
const query = ref('')
const category = ref('all')
const members = computed(() => (Array.isArray(props.body.members) ? props.body.members : [])
  .filter((member) => member.active !== false && member.name && member.category)
  .map((member, index) => ({ ...member, number: index + 1 })))
const categories = computed(() => [...new Set(members.value.map((member) => member.category))])
const filteredMembers = computed(() => {
  const search = query.value.trim().toLowerCase()
  return members.value.filter((member) => {
    if (category.value !== 'all' && member.category !== category.value) return false
    return !search || `${member.name} ${member.category}`.toLowerCase().includes(search)
  })
})
const reviewedLabel = computed(() => {
  if (!props.body.lastReviewed) return ''
  const date = new Date(`${props.body.lastReviewed}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? props.body.lastReviewed : new Intl.DateTimeFormat('en-UG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
})
const clearFilters = () => { query.value = ''; category.value = 'all' }
</script>

<template>
  <section class="public-body" :aria-labelledby="`${body.id}-title`">
    <header class="public-body__intro">
      <div><p>{{ body.acronym || 'Public forum' }}</p><h2 :id="`${body.id}-title`">{{ body.name }}</h2></div>
      <strong><PhUsersThree :size="25" weight="duotone" />{{ members.length }} confirmed members</strong>
    </header>
    <div class="public-body__purpose"><p>{{ body.summary }}</p><p>{{ body.purpose }}</p></div>

    <div class="public-body__controls">
      <label><span class="sr-only">Search forum members</span><PhMagnifyingGlass :size="20" /><input v-model="query" type="search" placeholder="Search a member or represented category" /><button v-if="query" type="button" aria-label="Clear member search" @click="query = ''"><PhX :size="17" /></button></label>
      <label><span class="sr-only">Filter forum members by category</span><select v-model="category"><option value="all">All represented categories</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></label>
      <p aria-live="polite">Showing <strong>{{ filteredMembers.length }}</strong> of {{ members.length }}</p>
    </div>

    <ol v-if="filteredMembers.length" class="public-body__members">
      <li v-for="member in filteredMembers" :key="member.id || member.name">
        <span>{{ String(member.number).padStart(2, '0') }}</span><div><h3>{{ member.name }}</h3><p>{{ member.category }}</p></div>
      </li>
    </ol>
    <div v-else class="public-body__empty"><h3>No member matches these filters</h3><p>Try another name or represented category.</p><button type="button" @click="clearFilters">Show all members</button></div>

    <footer><span>{{ body.sourceTitle }}</span><time v-if="reviewedLabel" :datetime="body.lastReviewed">Confirmed {{ reviewedLabel }}</time></footer>
  </section>
</template>

<style scoped>
.public-body { margin-top: 1.8rem; }
.public-body__intro { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2rem; align-items: end; border-bottom: 2px solid #17233a; padding-bottom: 1.3rem; }.public-body__intro p { color: #8f3f48; font-size: .65rem; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }.public-body__intro h2 { max-width: 42rem; margin-top: .55rem; font-size: clamp(1.8rem, 3.4vw, 3rem); font-weight: 840; letter-spacing: -.05em; line-height: 1.08; text-wrap: balance; }.public-body__intro > strong { display: flex; align-items: center; gap: .6rem; color: #71323a; font-size: .72rem; white-space: nowrap; }
.public-body__purpose { display: grid; grid-template-columns: .8fr 1.2fr; gap: 2.5rem; padding-block: 1.8rem 2.2rem; }.public-body__purpose p { color: rgb(21 27 38 / .67); font-size: .86rem; line-height: 1.8; }.public-body__purpose p:first-child { color: #17233a; font-family: var(--font-serif); font-size: 1.05rem; }
.public-body__controls { display: grid; grid-template-columns: minmax(15rem, 1fr) minmax(15rem, .8fr) auto; gap: .8rem; align-items: center; background: #eef1f4; padding: .8rem; }.public-body__controls label { display: grid; min-height: 3rem; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .6rem; background: white; padding-inline: .8rem; color: #8f3f48; }.public-body__controls input,.public-body__controls select { width: 100%; min-width: 0; border: 0; background: transparent; color: #17233a; font: inherit; font-size: .72rem; outline: 0; }.public-body__controls label:focus-within { box-shadow: 0 0 0 2px #8f3f48; }.public-body__controls label:nth-child(2) { grid-template-columns: 1fr; }.public-body__controls button { display: grid; width: 2rem; height: 2rem; place-items: center; }.public-body__controls > p { color: rgb(21 27 38 / .55); font-size: .65rem; white-space: nowrap; }.public-body__controls > p strong { color: #8f3f48; font-variant-numeric: tabular-nums; }
.public-body__members { display: grid; grid-template-columns: 1fr 1fr; margin-top: 1.4rem; border-top: 1px solid rgb(23 35 58 / .14); }.public-body__members li { display: grid; min-width: 0; grid-template-columns: 2.3rem minmax(0, 1fr); gap: .75rem; border-bottom: 1px solid rgb(23 35 58 / .12); padding: 1.15rem 1rem 1.15rem 0; }.public-body__members li:nth-child(odd) { border-right: 1px solid rgb(23 35 58 / .12); }.public-body__members li:nth-child(even) { padding-left: 1rem; }.public-body__members li > span { color: #8f3f48; font-family: ui-monospace, monospace; font-size: .65rem; font-weight: 850; font-variant-numeric: tabular-nums; }.public-body__members h3 { overflow-wrap: anywhere; font-size: .88rem; font-weight: 790; line-height: 1.4; }.public-body__members p { margin-top: .35rem; color: rgb(21 27 38 / .57); font-size: .68rem; line-height: 1.55; }
.public-body__empty { margin-top: 1.4rem; background: #f2f4f6; padding: 2rem; text-align: center; }.public-body__empty h3 { font-size: 1rem; }.public-body__empty p { margin-top: .4rem; color: rgb(21 27 38 / .58); font-size: .75rem; }.public-body__empty button { margin-top: 1rem; background: #17233a; padding: .65rem .8rem; color: white; font-size: .67rem; font-weight: 800; }
.public-body > footer { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.4rem; border-top: 1px solid rgb(23 35 58 / .12); padding-top: 1rem; color: rgb(21 27 38 / .48); font-size: .62rem; }
@media (max-width: 760px) { .public-body__intro,.public-body__purpose,.public-body__controls { grid-template-columns: 1fr; }.public-body__intro { align-items: start; }.public-body__intro > strong { white-space: normal; }.public-body__purpose { gap: 1rem; }.public-body__controls > p { padding-inline: .2rem; }.public-body__members { grid-template-columns: 1fr; }.public-body__members li { border-right: 0 !important; padding-left: 0 !important; }.public-body > footer { align-items: flex-start; flex-direction: column; } }
</style>
