<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhArrowSquareOut, PhCheck, PhCloudArrowUp, PhFileText, PhFolderOpen, PhNewspaper,
  PhPencilSimple, PhPlus, PhSignOut, PhSpinnerGap, PhSquaresFour, PhTrash, PhWarningCircle,
} from '@phosphor-icons/vue'
import { cmsAuth, cmsEntries } from '../../services/cms'
import { createSeedEntries, loadPublishedContent } from '../../stores/cmsContent'

const router = useRouter()
const collections = [
  { key: 'updates', label: 'News & notices', icon: PhNewspaper, fields: [
    { key: 'type', label: 'Type', required: true }, { key: 'date', label: 'Display date', required: true },
    { key: 'title', label: 'Headline', required: true }, { key: 'excerpt', label: 'Summary', type: 'textarea', required: true },
    { key: 'image', label: 'Image', type: 'media' },
  ] },
  { key: 'projects', label: 'Projects', icon: PhFolderOpen, fields: [
    { key: 'title', label: 'Project title', required: true }, { key: 'sector', label: 'Sector', required: true },
    { key: 'status', label: 'Project status', required: true }, { key: 'image', label: 'Image', type: 'media' },
  ] },
  { key: 'publications', label: 'Publications', icon: PhFileText, fields: [
    { key: 'title', label: 'Document title', required: true }, { key: 'category', label: 'Category', required: true },
    { key: 'format', label: 'Format', required: true }, { key: 'url', label: 'Document URL' },
  ] },
  { key: 'departments', label: 'Departments', icon: PhSquaresFour, fields: [
    { key: 'name', label: 'Department name', required: true }, { key: 'shortName', label: 'Short name' },
    { key: 'slug', label: 'URL slug', required: true }, { key: 'summary', label: 'Summary', type: 'textarea', required: true },
    { key: 'mandate', label: 'Mandate', type: 'textarea' }, { key: 'authority', label: 'Legal authority', type: 'textarea' },
    { key: 'lead', label: 'Department lead' }, { key: 'contact', label: 'Contact email', type: 'email' },
    { key: 'units', label: 'Units', type: 'list' }, { key: 'services', label: 'Services', type: 'list' },
  ] },
  { key: 'stats', label: 'Homepage statistics', icon: PhSquaresFour, fields: [
    { key: 'value', label: 'Value', required: true }, { key: 'label', label: 'Label', required: true },
    { key: 'detail', label: 'Supporting text' },
    { key: 'icon', label: 'Icon key', type: 'select', options: ['users', 'map', 'pin', 'home', 'education', 'health'] },
  ] },
]

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const seeding = ref(false)
const entries = ref([])
const profile = ref(null)
const session = ref(null)
const selectedCollection = ref('updates')
const editor = ref(null)
const deleteConfirmation = ref(false)
const feedback = reactive({ type: '', message: '' })

const definition = computed(() => collections.find((item) => item.key === selectedCollection.value))
const canPublish = computed(() => ['publisher', 'admin'].includes(profile.value?.role))
const canDelete = computed(() => ['publisher', 'admin'].includes(profile.value?.role))
const draftCount = computed(() => entries.value.filter((entry) => entry.status === 'draft').length)
const publishedCount = computed(() => entries.value.filter((entry) => entry.status === 'published').length)

const setFeedback = (type, message) => {
  feedback.type = type
  feedback.message = message
  window.setTimeout(() => { if (feedback.message === message) feedback.message = '' }, 4500)
}

const hydratePayload = (payload = {}) => {
  const next = { ...payload }
  definition.value.fields.forEach((field) => {
    if (field.type === 'list') next[field.key] = Array.isArray(next[field.key]) ? next[field.key].join('\n') : next[field.key] || ''
    else if (next[field.key] == null) next[field.key] = ''
  })
  return next
}

const loadEntries = async () => {
  loading.value = true
  editor.value = null
  try {
    entries.value = await cmsEntries.list(selectedCollection.value)
  } catch (error) {
    setFeedback('error', error.message || 'Content could not be loaded.')
  } finally {
    loading.value = false
  }
}

const newEntry = () => {
  deleteConfirmation.value = false
  editor.value = { id: null, collection: selectedCollection.value, title: '', slug: '', status: 'draft', sort_order: entries.value.length, payload: hydratePayload() }
}

const editEntry = (entry) => {
  deleteConfirmation.value = false
  editor.value = { ...entry, payload: hydratePayload(entry.payload) }
}

const serializePayload = () => {
  const payload = { ...editor.value.payload }
  definition.value.fields.forEach((field) => {
    if (field.type === 'list') payload[field.key] = String(payload[field.key] || '').split('\n').map((item) => item.trim()).filter(Boolean)
  })
  return payload
}

const saveEntry = async () => {
  saving.value = true
  try {
    const payload = serializePayload()
    const primaryTitle = payload.title || payload.name || payload.label
    if (!primaryTitle) throw new Error('Add a title or label before saving.')
    const saved = await cmsEntries.save({ ...editor.value, title: primaryTitle, slug: payload.slug || editor.value.slug, payload }, session.value.user.id)
    setFeedback('success', saved.status === 'published' ? 'Changes published.' : 'Draft saved.')
    await loadEntries()
    editEntry(saved)
    await loadPublishedContent()
  } catch (error) {
    setFeedback('error', error.message || 'Changes could not be saved.')
  } finally {
    saving.value = false
  }
}

const removeEntry = async () => {
  if (!editor.value?.id || !canDelete.value) return
  saving.value = true
  try {
    await cmsEntries.remove(editor.value.id)
    setFeedback('success', 'Entry deleted.')
    editor.value = null
    await loadEntries()
  } catch (error) {
    setFeedback('error', error.message || 'Entry could not be deleted.')
  } finally {
    saving.value = false
    deleteConfirmation.value = false
  }
}

const uploadMedia = async (event, field) => {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    editor.value.payload[field.key] = await cmsEntries.upload(file)
    setFeedback('success', 'Media uploaded.')
  } catch (error) {
    setFeedback('error', error.message || 'Media upload failed.')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const importStarterContent = async () => {
  seeding.value = true
  try {
    const allEntries = await cmsEntries.list()
    if (allEntries.length) throw new Error('Starter content can only be imported into an empty CMS.')
    for (const item of createSeedEntries()) await cmsEntries.save(item, session.value.user.id)
    setFeedback('success', 'Starter content imported as drafts.')
    await loadEntries()
  } catch (error) {
    setFeedback('error', error.message || 'Starter content could not be imported.')
  } finally {
    seeding.value = false
  }
}

const signOut = async () => {
  await cmsAuth.signOut()
  await router.replace('/admin/login')
}

watch(selectedCollection, loadEntries)
onMounted(async () => {
  try {
    session.value = await cmsAuth.getSession()
    if (!session.value) return router.replace('/admin/login')
    profile.value = await cmsAuth.getProfile(session.value.user.id)
    await loadEntries()
  } catch (error) {
    setFeedback('error', error.message || 'Your CMS profile could not be loaded.')
    loading.value = false
  }
})
</script>

<template>
  <div class="admin-cms">
    <aside class="admin-sidebar">
      <RouterLink class="admin-brand" to="/"><img src="/images/municipal-logo.png" alt="" /><span><small>MSMC</small><strong>Content office</strong></span></RouterLink>
      <nav aria-label="CMS collections">
        <p>Content</p>
        <button v-for="item in collections" :key="item.key" type="button" :class="{ 'is-active': selectedCollection === item.key }" @click="selectedCollection = item.key">
          <component :is="item.icon" :size="19" /><span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="admin-profile"><div><strong>{{ profile?.full_name || session?.user?.email }}</strong><small>{{ profile?.role || 'staff' }}</small></div><button type="button" aria-label="Sign out" @click="signOut"><PhSignOut :size="19" /></button></div>
    </aside>

    <main class="admin-main">
      <header class="admin-toolbar">
        <div><p>Municipal CMS</p><h1>{{ definition.label }}</h1></div>
        <div class="admin-toolbar__actions">
          <a href="/" target="_blank" rel="noreferrer">View website <PhArrowSquareOut :size="17" /></a>
          <button type="button" @click="newEntry"><PhPlus :size="17" weight="bold" /> New entry</button>
        </div>
      </header>

      <div v-if="feedback.message" class="admin-feedback" :class="`is-${feedback.type}`" role="status">
        <PhCheck v-if="feedback.type === 'success'" :size="18" weight="bold" /><PhWarningCircle v-else :size="18" />{{ feedback.message }}
      </div>

      <section class="admin-summary" aria-label="Collection summary">
        <div><span>Total</span><strong>{{ entries.length }}</strong></div><div><span>Published</span><strong>{{ publishedCount }}</strong></div><div><span>Drafts</span><strong>{{ draftCount }}</strong></div>
      </section>

      <section class="admin-workspace" :class="{ 'has-editor': editor }">
        <div class="admin-list">
          <div class="admin-list__heading"><span>Entry</span><span>Status</span><span>Updated</span></div>
          <div v-if="loading" class="admin-state"><PhSpinnerGap class="admin-spin" :size="24" /> Loading content</div>
          <div v-else-if="!entries.length" class="admin-state admin-state--empty">
            <PhFolderOpen :size="30" /><strong>No {{ definition.label.toLowerCase() }} yet</strong><p>Create the first entry or import the website’s starter content.</p>
            <div><button type="button" @click="newEntry"><PhPlus :size="16" /> Create entry</button><button type="button" :disabled="seeding" @click="importStarterContent"><PhCloudArrowUp :size="16" /> {{ seeding ? 'Importing…' : 'Import starter content' }}</button></div>
          </div>
          <button v-for="entry in entries" v-else :key="entry.id" type="button" class="admin-row" :class="{ 'is-selected': editor?.id === entry.id }" @click="editEntry(entry)">
            <span><strong>{{ entry.title }}</strong><small>{{ entry.slug || entry.collection }}</small></span>
            <em :class="`is-${entry.status}`">{{ entry.status }}</em>
            <time>{{ new Date(entry.updated_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' }) }}</time>
            <PhPencilSimple :size="17" />
          </button>
        </div>

        <form v-if="editor" class="admin-editor" @submit.prevent="saveEntry">
          <div class="admin-editor__heading"><div><p>{{ editor.id ? 'Edit entry' : 'New entry' }}</p><h2>{{ editor.title || 'Untitled' }}</h2></div><button type="button" aria-label="Close editor" @click="editor = null">×</button></div>
          <div class="admin-editor__fields">
            <label v-for="field in definition.fields" :key="field.key" :class="{ 'is-wide': ['textarea', 'list', 'media'].includes(field.type) }">
              <span>{{ field.label }} <b v-if="field.required">Required</b></span>
              <textarea v-if="field.type === 'textarea'" v-model="editor.payload[field.key]" rows="4" :required="field.required"></textarea>
              <textarea v-else-if="field.type === 'list'" v-model="editor.payload[field.key]" rows="5" :required="field.required" placeholder="One item per line"></textarea>
              <select v-else-if="field.type === 'select'" v-model="editor.payload[field.key]"><option v-for="option in field.options" :key="option" :value="option">{{ option }}</option></select>
              <div v-else-if="field.type === 'media'" class="admin-media-field"><input v-model="editor.payload[field.key]" type="url" placeholder="Image URL" /><label><input type="file" accept="image/*" @change="uploadMedia($event, field)" /><PhCloudArrowUp :size="17" /> {{ uploading ? 'Uploading…' : 'Upload' }}</label></div>
              <input v-else v-model="editor.payload[field.key]" :type="field.type || 'text'" :required="field.required" />
            </label>
            <label><span>Order</span><input v-model.number="editor.sort_order" type="number" min="0" /></label>
            <label><span>Publishing state</span><select v-model="editor.status"><option value="draft">Draft</option><option value="published" :disabled="!canPublish">Published</option></select><small v-if="!canPublish">A publisher must approve this entry.</small></label>
          </div>
          <footer class="admin-editor__footer">
            <div v-if="editor.id && canDelete" class="admin-delete">
              <button v-if="!deleteConfirmation" type="button" @click="deleteConfirmation = true"><PhTrash :size="16" /> Delete</button>
              <span v-else>Delete permanently? <button type="button" @click="removeEntry">Confirm</button><button type="button" @click="deleteConfirmation = false">Cancel</button></span>
            </div>
            <button class="admin-save" type="submit" :disabled="saving"><PhSpinnerGap v-if="saving" class="admin-spin" :size="17" /><PhCheck v-else :size="17" weight="bold" /> {{ saving ? 'Saving…' : editor.status === 'published' ? 'Publish changes' : 'Save draft' }}</button>
          </footer>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-cms { display: grid; min-height: 100dvh; grid-template-columns: 16.5rem minmax(0, 1fr); background: #eef0ec; color: #13231d; }
.admin-sidebar { position: sticky; top: 0; display: flex; height: 100dvh; flex-direction: column; background: #082f25; padding: 1.1rem; color: white; }
.admin-brand { display: flex; align-items: center; gap: .75rem; border-bottom: 1px solid rgb(255 255 255 / .1); padding: .5rem .4rem 1.25rem; color: white; }
.admin-brand img { width: 2.8rem; height: 2.8rem; object-fit: contain; }
.admin-brand small, .admin-brand strong { display: block; }.admin-brand small { color: #e8c774; font-size: .55rem; font-weight: 850; letter-spacing: .13em; }.admin-brand strong { margin-top: .15rem; font-size: .78rem; }
.admin-sidebar nav { margin-top: 2rem; }.admin-sidebar nav > p { padding-inline: .75rem; color: rgb(255 255 255 / .38); font-size: .56rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.admin-sidebar nav button { display: flex; width: 100%; min-height: 3rem; align-items: center; gap: .75rem; margin-top: .3rem; padding: .65rem .75rem; color: rgb(255 255 255 / .62); font-size: .7rem; font-weight: 750; text-align: left; transition: background-color 220ms, color 220ms, transform 220ms; }
.admin-sidebar nav button:hover { transform: translateX(2px); color: white; }.admin-sidebar nav button.is-active { background: rgb(255 255 255 / .09); color: #f4d98f; }
.admin-profile { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: auto; border-top: 1px solid rgb(255 255 255 / .1); padding: 1rem .45rem 0; }.admin-profile strong,.admin-profile small { display: block; max-width: 11rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.admin-profile strong { font-size: .66rem; }.admin-profile small { margin-top: .25rem; color: #e8c774; font-size: .55rem; text-transform: capitalize; }.admin-profile button { color: rgb(255 255 255 / .55); }
.admin-main { min-width: 0; padding: clamp(1.25rem, 3vw, 3rem); }.admin-toolbar { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }.admin-toolbar p { color: #8b6719; font-size: .6rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }.admin-toolbar h1 { margin-top: .45rem; font-size: clamp(2rem, 3.5vw, 3.5rem); font-weight: 900; line-height: 1; letter-spacing: -.055em; }
.admin-toolbar__actions { display: flex; gap: .6rem; }.admin-toolbar__actions a,.admin-toolbar__actions button { display: flex; min-height: 2.9rem; align-items: center; gap: .5rem; padding: .7rem .85rem; font-size: .68rem; font-weight: 800; }.admin-toolbar__actions a { border: 1px solid rgb(7 59 44 / .18); color: #29433a; }.admin-toolbar__actions button { background: #073b2c; color: white; }
.admin-feedback { position: fixed; z-index: 10; top: 1rem; right: 1rem; display: flex; max-width: 24rem; align-items: center; gap: .55rem; padding: .85rem 1rem; color: white; font-size: .7rem; font-weight: 750; box-shadow: 0 1rem 3rem rgb(7 59 44 / .22); }.admin-feedback.is-success { background: #0b513d; }.admin-feedback.is-error { background: #8c3434; }
.admin-summary { display: grid; margin-top: 2rem; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid rgb(7 59 44 / .12); border-bottom: 1px solid rgb(7 59 44 / .12); }.admin-summary > div { display: flex; min-height: 5.5rem; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-right: 1px solid rgb(7 59 44 / .12); }.admin-summary > div:last-child { border: 0; }.admin-summary span { color: #617168; font-size: .65rem; font-weight: 750; }.admin-summary strong { font-size: 1.7rem; font-variant-numeric: tabular-nums; }
.admin-workspace { display: grid; margin-top: 1.5rem; grid-template-columns: 1fr; align-items: start; gap: 1rem; }.admin-workspace.has-editor { grid-template-columns: minmax(24rem, .85fr) minmax(28rem, 1.15fr); }.admin-list,.admin-editor { background: white; box-shadow: inset 0 0 0 1px rgb(7 59 44 / .07); }.admin-list__heading,.admin-row { display: grid; grid-template-columns: minmax(0, 1fr) 5.5rem 7rem 1.5rem; gap: 1rem; align-items: center; }.admin-list__heading { min-height: 2.8rem; padding: .6rem 1rem; color: #728077; font-size: .56rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }.admin-row { width: 100%; min-height: 4.7rem; border-top: 1px solid rgb(7 59 44 / .08); padding: .75rem 1rem; text-align: left; transition: background-color 220ms; }.admin-row:hover,.admin-row.is-selected { background: #f3f5f1; }.admin-row strong,.admin-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.admin-row strong { font-size: .72rem; }.admin-row small { margin-top: .3rem; color: #79867f; font-size: .56rem; }.admin-row em { width: max-content; padding: .3rem .45rem; font-size: .53rem; font-style: normal; font-weight: 850; text-transform: uppercase; }.admin-row em.is-published { background: #e4f0ea; color: #1d624b; }.admin-row em.is-draft { background: #f2ede0; color: #82621d; }.admin-row time { color: #6f7d76; font-size: .58rem; }
.admin-state { display: flex; min-height: 15rem; align-items: center; justify-content: center; gap: .6rem; color: #68766e; font-size: .7rem; }.admin-state--empty { flex-direction: column; text-align: center; }.admin-state--empty strong { margin-top: .4rem; font-size: .9rem; color: #21372e; }.admin-state--empty p { max-width: 22rem; font-size: .65rem; }.admin-state--empty > div { display: flex; gap: .5rem; margin-top: .8rem; }.admin-state--empty button { display: flex; align-items: center; gap: .4rem; border: 1px solid rgb(7 59 44 / .18); padding: .6rem .7rem; color: #073b2c; font-size: .62rem; font-weight: 800; }
.admin-editor { position: sticky; top: 1rem; }.admin-editor__heading { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; border-bottom: 1px solid rgb(7 59 44 / .1); padding: 1rem 1.25rem; }.admin-editor__heading p { color: #8b6719; font-size: .55rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.admin-editor__heading h2 { max-width: 28rem; margin-top: .3rem; overflow: hidden; font-size: 1.15rem; font-weight: 850; text-overflow: ellipsis; white-space: nowrap; }.admin-editor__heading > button { font-size: 1.6rem; color: #68766e; }.admin-editor__fields { display: grid; max-height: calc(100dvh - 14rem); overflow-y: auto; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; padding: 1.25rem; }.admin-editor label.is-wide { grid-column: 1 / -1; }.admin-editor label > span { display: flex; align-items: center; justify-content: space-between; margin-bottom: .45rem; font-size: .62rem; font-weight: 800; }.admin-editor label > span b { color: #8b6719; font-size: .49rem; letter-spacing: .08em; text-transform: uppercase; }.admin-editor input,.admin-editor textarea,.admin-editor select { width: 100%; border: 1px solid rgb(7 59 44 / .16); background: #fbfcfa; padding: .72rem .8rem; font-size: .7rem; outline: none; }.admin-editor input,.admin-editor select { min-height: 2.9rem; }.admin-editor textarea { resize: vertical; line-height: 1.55; }.admin-editor input:focus,.admin-editor textarea:focus,.admin-editor select:focus { border-color: #a8791e; box-shadow: 0 0 0 3px rgb(168 121 30 / .1); }.admin-editor label > small { display: block; margin-top: .35rem; color: #8b6719; font-size: .55rem; }.admin-media-field { display: grid; grid-template-columns: 1fr auto; }.admin-media-field > label { display: flex; align-items: center; gap: .4rem; background: #073b2c; padding-inline: .8rem; color: white; font-size: .62rem; font-weight: 800; cursor: pointer; }.admin-media-field > label input { display: none; }
.admin-editor__footer { display: flex; min-height: 4.8rem; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid rgb(7 59 44 / .1); padding: .8rem 1.25rem; }.admin-save { display: flex; min-height: 2.8rem; align-items: center; gap: .45rem; margin-left: auto; background: #073b2c; padding: .65rem .85rem; color: white; font-size: .65rem; font-weight: 850; }.admin-save:disabled { opacity: .55; }.admin-delete > button { display: flex; align-items: center; gap: .4rem; color: #9a3b3b; font-size: .62rem; font-weight: 800; }.admin-delete > span { font-size: .6rem; }.admin-delete > span button { margin-left: .45rem; color: #9a3b3b; font-weight: 850; }.admin-spin { animation: admin-spin .8s linear infinite; }
@keyframes admin-spin { to { transform: rotate(360deg); } }
@media (max-width: 1050px) { .admin-workspace.has-editor { grid-template-columns: 1fr; }.admin-editor { position: static; }.admin-editor__fields { max-height: none; } }
@media (max-width: 760px) { .admin-cms { grid-template-columns: 1fr; }.admin-sidebar { position: static; height: auto; padding: .8rem; }.admin-sidebar nav { display: flex; overflow-x: auto; margin-top: .8rem; }.admin-sidebar nav > p { display: none; }.admin-sidebar nav button { width: max-content; flex-shrink: 0; }.admin-profile { margin-top: .8rem; padding: .8rem .45rem 0; }.admin-main { padding: 1rem; }.admin-toolbar { align-items: flex-start; flex-direction: column; }.admin-toolbar__actions { width: 100%; }.admin-toolbar__actions a,.admin-toolbar__actions button { flex: 1; justify-content: center; }.admin-summary > div { min-height: 4.5rem; flex-direction: column; justify-content: center; gap: .35rem; }.admin-workspace.has-editor { display: block; }.admin-list__heading { display: none; }.admin-row { grid-template-columns: minmax(0, 1fr) auto 1.2rem; }.admin-row time { display: none; }.admin-editor { margin-top: 1rem; }.admin-editor__fields { grid-template-columns: 1fr; }.admin-editor label.is-wide { grid-column: auto; } }
</style>
