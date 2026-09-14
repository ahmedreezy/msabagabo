<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { educationGroups, educationPublicationIssues, emptyEducationProfile, moveEducationEntry, normalizeEducationProfile, safeLink } from '../../lib/educationProfile.js'
import { createEducationDraft } from '../../data/educationDraft.js'
import { cmsEntries } from '../../services/cms'

const props = defineProps({ modelValue: Object, department: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'uploading'])
const profile = computed(() => normalizeEducationProfile(props.modelValue))
const issues = computed(() => educationPublicationIssues({ ...props.department, educationProfile: profile.value }))
const uploadState = ref('')
const uploadError = ref('')
const openEntry = ref('')
let mounted = true
onBeforeUnmount(() => { mounted = false; emit('uploading', false) })
const publishUpdate = (next) => emit('update:modelValue', next)
const updateItem = (key, id, field, value) => {
  const next = normalizeEducationProfile(props.modelValue)
  const item = next[key].find((record) => record.id === id)
  if (!item) return
  item[field] = value
  if (field !== 'reviewed') item.reviewed = false
  next.approved = false
  publishUpdate(next)
}
const addItem = (group) => {
  const next = normalizeEducationProfile(props.modelValue)
  const id = crypto.randomUUID()
  next[group.key].push({ id, ...Object.fromEntries(group.fields.map((field) => [field.key, field.type === 'lines' ? [] : ''])), sourceUrl: '', reviewed: false, reviewNote: '' })
  next.approved = false
  openEntry.value = id
  publishUpdate(next)
}
const removeItem = (key, id) => {
  const next = normalizeEducationProfile(props.modelValue)
  next[key] = next[key].filter((item) => item.id !== id)
  next.approved = false
  publishUpdate(next)
}
const moveItem = (key, index, direction) => {
  const next = moveEducationEntry(props.modelValue, key, index, direction)
  next.approved = false
  publishUpdate(next)
}
const updateReview = (key, value) => publishUpdate({ ...profile.value, approved: false, [key]: value })
const upload = async (event, key, id, field) => {
  const file = event.target.files?.[0]
  if (!file) return
  const isImage = field.type === 'image'
  if (file.size > 10 * 1024 * 1024 || (isImage ? !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : !/\.(pdf|docx?|xlsx?)$/i.test(file.name))) {
    uploadError.value = 'Choose a supported file smaller than 10 MB.'
    event.target.value = ''
    return
  }
  uploadState.value = id
  uploadError.value = ''
  emit('uploading', true)
  try {
    const url = await cmsEntries.upload(file, { download: !isImage })
    if (mounted) updateItem(key, id, field.key, url)
  } catch (error) {
    if (mounted) uploadError.value = error.message || 'Upload failed. Your existing file has been kept.'
  } finally {
    if (mounted) { uploadState.value = ''; emit('uploading', false) }
    event.target.value = ''
  }
}
</script>

<template>
  <section class="education-editor" aria-label="Education page content">
    <header><p>Education &amp; Sports pilot</p><h3>Build the department page</h3><span>Manage the school directory, guidance and resources. Staff names and portraits use the team fields above.</span></header>
    <div v-if="!modelValue" class="education-editor-start"><p>Choose a blank profile or start with the municipal research draft. Neither option publishes content.</p><button type="button" @click="publishUpdate(createEducationDraft())">Load research draft</button><button type="button" @click="publishUpdate(emptyEducationProfile())">Start with a blank profile</button></div>
    <template v-else>
      <div class="education-editor-review">
        <label><span>Overall editorial review notes</span><textarea :value="profile.reviewNotes" rows="4" @input="updateReview('reviewNotes', $event.target.value)" /></label>
        <p>Resolve and clear notes, verify each entry against its source, then approve the introduction, mandate, legal authority and staff below. Any edit requires a fresh approval.</p>
        <label class="education-editor-check"><input type="checkbox" :checked="profile.approved" @change="updateReview('approved', $event.target.checked)" /><span>I have checked the department’s introduction, mandate, authority and staff, and reviewed the complete page.</span></label>
        <details v-if="issues.length" class="education-editor-issues"><summary>{{ issues.length }} publication {{ issues.length === 1 ? 'issue' : 'issues' }} to resolve</summary><ul><li v-for="(issue, index) in issues" :key="index">{{ issue }}</li></ul></details>
        <p v-else class="education-editor-ready" role="status">Review checks complete. A publisher can publish this department.</p>
      </div>
      <p v-if="uploadError" class="education-editor-error" role="alert">{{ uploadError }}</p>
      <details v-for="group in educationGroups" :key="group.key" class="education-editor-group" :open="group.key === 'guidance'">
        <summary>{{ group.title }} <span>{{ profile[group.key].length }}</span></summary>
        <div class="education-editor-group__body">
          <p v-if="!profile[group.key].length" class="education-editor-empty">No entries yet. Empty optional sections stay hidden on the published page.</p>
          <details v-for="(item, index) in profile[group.key]" :key="item.id" class="education-editor-entry" :open="openEntry === item.id">
            <summary><span>{{ index + 1 }}. {{ item.title || item.name || item.label || `New ${group.singular}` }}</span><em>{{ item.reviewed && !item.reviewNote ? 'Verified' : 'Needs review' }}</em></summary>
            <div class="education-editor-entry__fields">
              <div v-for="field in group.fields" :key="field.key" class="education-editor-field"><label :for="`education-${item.id}-${field.key}`"><span>{{ field.label }} <small v-if="field.required">Required to publish</small></span></label>
                <select v-if="field.options" :id="`education-${item.id}-${field.key}`" :value="item[field.key] || ''" :disabled="!!uploadState" @change="updateItem(group.key, item.id, field.key, $event.target.value)"><option value="">Choose {{ field.label.toLowerCase() }}</option><option v-for="option in field.options" :key="option">{{ option }}</option></select>
                <textarea v-else-if="['textarea', 'lines'].includes(field.type)" :id="`education-${item.id}-${field.key}`" :value="field.type === 'lines' ? (item[field.key] || []).join('\n') : item[field.key]" rows="3" :disabled="!!uploadState" @input="updateItem(group.key, item.id, field.key, field.type === 'lines' ? $event.target.value.split('\n') : $event.target.value)" />
                <template v-else-if="['image', 'document'].includes(field.type)">
                  <input :id="`education-${item.id}-${field.key}`" :value="item[field.key]" type="text" placeholder="https://… or /images/…" :disabled="!!uploadState" @input="updateItem(group.key, item.id, field.key, $event.target.value)" />
                  <img v-if="field.type === 'image' && safeLink(item[field.key])" class="education-editor-image" :src="safeLink(item[field.key])" :alt="item.caption || 'Activity photograph preview'" />
                  <label class="education-editor-upload">{{ uploadState === item.id ? 'Uploading…' : field.type === 'image' ? 'Upload a photograph' : 'Upload a document' }}<input type="file" :accept="field.type === 'image' ? 'image/jpeg,image/png,image/webp' : '.pdf,.doc,.docx,.xls,.xlsx'" :disabled="!!uploadState" @change="upload($event, group.key, item.id, field)" /></label>
                </template>
                <input v-else :id="`education-${item.id}-${field.key}`" :value="item[field.key]" :type="field.type || 'text'" :disabled="!!uploadState" @input="updateItem(group.key, item.id, field.key, $event.target.value)" />
              </div>
              <label><span>Source reference <small>Required to publish</small></span><input :value="item.sourceUrl" type="text" placeholder="Official source URL or uploaded municipal document" :disabled="!!uploadState" @input="updateItem(group.key, item.id, 'sourceUrl', $event.target.value)" /></label>
              <label><span>Review note <small>Editor only</small></span><textarea :value="item.reviewNote" rows="2" :disabled="!!uploadState" @input="updateItem(group.key, item.id, 'reviewNote', $event.target.value)" /></label>
              <label class="education-editor-check"><input type="checkbox" :checked="item.reviewed" :disabled="!!uploadState" @change="updateItem(group.key, item.id, 'reviewed', $event.target.checked)" /><span>Verified against the source; ready for publication.</span></label>
              <div class="education-editor-entry__actions"><button type="button" :disabled="index === 0 || !!uploadState" :aria-label="`Move ${item.title || item.name || group.singular} up`" @click="moveItem(group.key, index, -1)">Move up</button><button type="button" :disabled="index === profile[group.key].length - 1 || !!uploadState" :aria-label="`Move ${item.title || item.name || group.singular} down`" @click="moveItem(group.key, index, 1)">Move down</button><button type="button" :disabled="!!uploadState" :aria-label="`Remove ${item.title || item.name || group.singular}`" @click="removeItem(group.key, item.id)">Remove</button></div>
            </div>
          </details>
          <button class="education-editor-add" type="button" :disabled="!!uploadState" @click="addItem(group)">+ Add {{ group.singular }}</button>
        </div>
      </details>
    </template>
  </section>
</template>

<style scoped>
.education-editor { grid-column: 1 / -1; min-width: 0; border-top: 3px solid #17634c; margin-top: 1rem; padding-top: 1.4rem; color: #19372a; }
.education-editor header > p { font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; color: #59715f; font-weight: 800; }
.education-editor h3 { margin-top: .4rem; font-size: 1.3rem; font-weight: 800; }
.education-editor header > span, .education-editor-start > p, .education-editor-review > p, .education-editor-empty { display: block; margin-top: .7rem; font-size: .82rem; line-height: 1.65; color: #5c6a60; }
.education-editor-start { padding: 1rem 0; }
.education-editor button { min-height: 2.75rem; padding: .65rem .9rem; background: #e8eee7; color: #214d37; font-size: .78rem; font-weight: 700; cursor: pointer; }
.education-editor button:hover { background: #d6e2d4; }
.education-editor button:disabled { opacity: .45; cursor: default; }
.education-editor-start button { margin: 1rem .5rem 0 0; }
.education-editor-review { padding: 1.15rem; margin-block: 1.5rem; background: #f5f0df; }
.education-editor label { display: grid; gap: .45rem; min-width: 0; font-size: .8rem; font-weight: 700; }
.education-editor-field { display: grid; gap: .45rem; min-width: 0; }
.education-editor label small { display: block; font-size: .68rem; font-weight: 500; color: #6a7167; }
.education-editor input:not([type=checkbox]), .education-editor textarea, .education-editor select { width: 100%; min-width: 0; border: 1px solid #c3cdc0; padding: .7rem; border-radius: 0; background: #fffefa; font-size: .88rem; font-weight: 450; color: #243d2d; }
.education-editor .education-editor-check { display: flex; align-items: flex-start; gap: .6rem; margin-top: 1rem; font-weight: 500; line-height: 1.6; }
.education-editor-check input { width: 1.1rem; height: 1.1rem; flex: none; margin-top: .13rem; accent-color: #17634c; }
.education-editor-group { border: 1px solid #d7dfd3; margin-top: .7rem; }
.education-editor summary { cursor: pointer; padding: 1rem; font-size: .86rem; font-weight: 750; line-height: 1.6; }
.education-editor-group > summary { background: #edf1e9; }
.education-editor-group > summary > span { margin-left: .6rem; color: #6d785f; font-weight: 500; }
.education-editor-group__body { padding: .7rem; }
.education-editor-entry { border-bottom: 1px solid #d7dfd3; }
.education-editor-entry > summary { font-size: .8rem; padding: .85rem .35rem; }
.education-editor-entry > summary em { display: inline-block; margin-left: .6rem; color: #8c6a25; font-size: .68rem; font-style: normal; font-weight: 500; }
.education-editor-entry__fields { display: grid; gap: 1rem; padding: .8rem .25rem 1.25rem; }
.education-editor-entry__actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.education-editor .education-editor-add { margin-top: 1rem; background: #174d37; color: white; }
.education-editor-issues { margin-top: 1rem; color: #745017; }
.education-editor-issues > summary { padding: .65rem 0; }
.education-editor-issues ul { max-height: 16rem; overflow: auto; padding: .5rem 1.2rem; list-style: disc; font-size: .78rem; line-height: 1.8; }
.education-editor-image { width: 100%; max-height: 14rem; object-fit: contain; background: #edf1e9; }
.education-editor-upload { display: grid; gap: .5rem; font-size: .75rem; }
.education-editor-error { padding: 1rem; background: #fff1ed; color: #943e2d; font-size: .85rem; }
.education-editor :focus-visible { outline: 3px solid #a6772c; outline-offset: 3px; }
</style>
