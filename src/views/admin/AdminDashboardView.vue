<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhArrowSquareOut, PhCheck, PhCloudArrowUp, PhFileText, PhFolderOpen, PhNewspaper,
  PhCloudSun, PhEye, PhLeaf, PhPencilSimple, PhPlus, PhSignOut, PhSpinnerGap, PhSquaresFour, PhTrash, PhUsersThree, PhWarningCircle,
} from '@phosphor-icons/vue'
import { cmsAuth, cmsEntries } from '../../services/cms'
import { createSeedEntries, formatCmsDate, loadPublishedContent } from '../../stores/cmsContent'

const router = useRouter()
const pageGroups = [
  { label: 'Homepage', items: [
    { key: 'environment', label: 'Daily environment', mobileLabel: 'Today', page: 'Homepage', section: 'Today in Makindye Ssabagabo', icon: PhCloudSun, route: '/', chronological: true, fields: [
      { key: 'date', label: 'Bulletin date', type: 'date', required: true },
      { key: 'location', label: 'Location', required: true },
      { key: 'weatherCondition', label: 'Weather condition', type: 'select', required: true, options: ['Clear', 'Partly cloudy', 'Cloudy', 'Light rain', 'Heavy rain', 'Thunderstorm', 'Windy', 'Foggy'] },
      { key: 'temperature', label: 'Current temperature (°C)', type: 'number', required: true, min: -10, max: 60, step: 1 },
      { key: 'highTemperature', label: 'Highest temperature (°C)', type: 'number', required: true, min: -10, max: 60, step: 1 },
      { key: 'lowTemperature', label: 'Lowest temperature (°C)', type: 'number', required: true, min: -10, max: 60, step: 1 },
      { key: 'rainChance', label: 'Chance of rain (%)', type: 'number', required: true, min: 0, max: 100, step: 1 },
      { key: 'humidity', label: 'Humidity (%)', type: 'number', required: true, min: 0, max: 100, step: 1 },
      { key: 'windSpeed', label: 'Wind speed (km/h)', type: 'number', required: true, min: 0, max: 250, step: 1 },
      { key: 'weatherGuidance', label: 'Weather guidance', type: 'textarea', required: true },
      { key: 'aqi', label: 'Air Quality Index (AQI)', type: 'number', required: true, min: 0, max: 500, step: 1 },
      { key: 'pm25', label: 'PM2.5 (µg/m³)', type: 'number', required: true, min: 0, max: 1000, step: 0.1 },
      { key: 'pm10', label: 'PM10 (µg/m³)', type: 'number', required: true, min: 0, max: 1500, step: 0.1 },
      { key: 'airQualityGuidance', label: 'Air-quality guidance', type: 'textarea', required: true },
    ] },
    { key: 'leadership', label: 'Leadership team', mobileLabel: 'Leaders', page: 'Homepage', section: 'MSMC leadership team', icon: PhUsersThree, route: '/#leadership', fields: [
      { key: 'slug', label: 'Leadership position', type: 'select', required: true, options: ['mayor', 'town-clerk', 'speaker', 'heads-of-directorates'] },
      { key: 'name', label: 'Officer full name' },
      { key: 'role', label: 'Official role', required: true },
      { key: 'office', label: 'Office or directorate', required: true },
      { key: 'description', label: 'Responsibility summary', type: 'textarea', required: true },
      { key: 'image', label: 'Officer photograph', type: 'media' },
      { key: 'mark', label: 'Fallback initials', required: true },
    ] },
    { key: 'stats', label: 'Statistics', mobileLabel: 'Home', page: 'Homepage', section: 'At a glance', icon: PhSquaresFour, route: '/', fields: [
      { key: 'value', label: 'Value', required: true }, { key: 'label', label: 'Label', required: true },
      { key: 'detail', label: 'Supporting text' },
      { key: 'icon', label: 'Visual icon', type: 'select', options: ['users', 'map', 'pin', 'home', 'education', 'health'] },
    ] },
    { key: 'projects', label: 'Featured projects', mobileLabel: 'Projects', page: 'Homepage', section: 'Delivery in action', icon: PhFolderOpen, route: '/projects', fields: [
      { key: 'title', label: 'Project title', required: true }, { key: 'sector', label: 'Sector', required: true },
      { key: 'status', label: 'Project status', required: true }, { key: 'image', label: 'Project image', type: 'media' },
    ] },
    { key: 'updates', label: 'Latest news', mobileLabel: 'News', page: 'Homepage', section: 'News & notices', icon: PhNewspaper, route: '/news', chronological: true, fields: [
      { key: 'date', label: 'Publication date', type: 'date', required: true }, { key: 'type', label: 'Update type', required: true },
      { key: 'title', label: 'Headline', required: true }, { key: 'excerpt', label: 'Summary', type: 'textarea', required: true },
      { key: 'image', label: 'Featured image', type: 'media' },
    ] },
  ] },
  { label: 'Departments & services', items: [
    { key: 'departments', label: 'Departments', mobileLabel: 'Depts', page: 'Departments & services', section: 'Department directory', icon: PhSquaresFour, route: '/departments', fields: [
      { key: 'name', label: 'Department name', required: true }, { key: 'shortName', label: 'Short name' },
      { key: 'slug', label: 'Page URL', required: true }, { key: 'summary', label: 'Introduction', type: 'textarea', required: true },
      { key: 'mandate', label: 'Mandate', type: 'textarea' }, { key: 'authority', label: 'Legal authority', type: 'textarea' },
      { key: 'lead', label: 'Department lead' }, { key: 'contact', label: 'Contact email', type: 'email' },
      { key: 'units', label: 'Units and sub-departments', type: 'list' }, { key: 'services', label: 'Services offered', type: 'list' },
      { key: 'team', label: 'Department team', type: 'team', required: true },
    ] },
  ] },
  { label: 'News & resources', items: [
    { key: 'publications', label: 'Publications', mobileLabel: 'Files', page: 'News & resources', section: 'Document library', icon: PhFileText, route: '/news#publications', fields: [
      { key: 'title', label: 'Document title', required: true }, { key: 'category', label: 'Category', required: true },
      { key: 'format', label: 'File format', type: 'select', required: true, options: ['PDF', 'Word document', 'Excel spreadsheet', 'PowerPoint presentation', 'CSV', 'Text document'] },
      { key: 'url', label: 'Document file', type: 'file', required: true },
    ] },
  ] },
]

const collections = pageGroups.flatMap((group) => group.items)
const documentExtensions = {
  PDF: ['pdf'],
  'Word document': ['doc', 'docx'],
  'Excel spreadsheet': ['xls', 'xlsx'],
  'PowerPoint presentation': ['ppt', 'pptx'],
  CSV: ['csv'],
  'Text document': ['txt'],
}

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const seeding = ref(false)
const entries = ref([])
const profile = ref(null)
const session = ref(null)
const selectedCollection = ref('stats')
const editor = ref(null)
const deleteConfirmation = ref(false)
const previewOpen = ref(false)
const previewItem = ref(null)
const feedback = reactive({ type: '', message: '' })
const mediaPreviews = reactive({})

const definition = computed(() => collections.find((item) => item.key === selectedCollection.value))
const canPublish = computed(() => ['publisher', 'admin'].includes(profile.value?.role))
const canDelete = computed(() => ['publisher', 'admin'].includes(profile.value?.role))
const draftCount = computed(() => entries.value.filter((entry) => entry.status === 'draft').length)
const publishedCount = computed(() => entries.value.filter((entry) => entry.status === 'published').length)
const entryDisplayDate = (entry) => definition.value.chronological
  ? formatCmsDate(entry.payload.date)
  : new Date(entry.updated_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })

const airQualityCategory = (value) => {
  const aqi = Number(value)
  if (!Number.isFinite(aqi)) return 'AQI category'
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

const setFeedback = (type, message) => {
  feedback.type = type
  feedback.message = message
  window.setTimeout(() => { if (feedback.message === message) feedback.message = '' }, 4500)
}

const selectCollection = (key) => {
  if (selectedCollection.value === key) return
  selectedCollection.value = key
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearMediaPreviews = () => {
  Object.entries(mediaPreviews).forEach(([key, url]) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    delete mediaPreviews[key]
  })
}

const mediaPreview = (field) => mediaPreviews[field.key] || editor.value?.payload?.[field.key]

const hydratePayload = (payload = {}) => {
  const next = { ...payload }
  definition.value.fields.forEach((field) => {
    if (field.type === 'list') next[field.key] = Array.isArray(next[field.key]) ? next[field.key].join('\n') : next[field.key] || ''
    else if (field.type === 'team') next[field.key] = Array.isArray(next[field.key]) ? next[field.key].map((member) => ({ name: '', role: '', photo: '', ...member })) : []
    else if (field.type === 'date' && next[field.key]) {
      const parsed = new Date(next[field.key])
      next[field.key] = Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
    }
    else if (next[field.key] == null) next[field.key] = ''
  })
  return next
}

const loadEntries = async () => {
  loading.value = true
  clearMediaPreviews()
  editor.value = null
  try {
    const loadedEntries = await cmsEntries.list(selectedCollection.value)
    entries.value = definition.value.chronological
      ? loadedEntries.sort((a, b) => Date.parse(b.payload.date || '') - Date.parse(a.payload.date || ''))
      : loadedEntries
  } catch (error) {
    setFeedback('error', error.message || 'Content could not be loaded.')
  } finally {
    loading.value = false
  }
}

const newEntry = () => {
  clearMediaPreviews()
  deleteConfirmation.value = false
  editor.value = { id: null, collection: selectedCollection.value, title: '', slug: '', status: 'draft', sort_order: entries.value.length, payload: hydratePayload() }
}

const editEntry = (entry) => {
  clearMediaPreviews()
  deleteConfirmation.value = false
  editor.value = { ...entry, payload: hydratePayload(entry.payload) }
}

const serializePayload = () => {
  const payload = { ...editor.value.payload }
  definition.value.fields.forEach((field) => {
    if (field.type === 'list') payload[field.key] = String(payload[field.key] || '').split('\n').map((item) => item.trim()).filter(Boolean)
    if (field.type === 'team') payload[field.key] = (payload[field.key] || []).map((member) => ({
      name: String(member.name || '').trim(),
      role: String(member.role || '').trim(),
      photo: String(member.photo || '').trim(),
    }))
  })
  return payload
}

const previewEntry = () => {
  const payload = serializePayload()
  definition.value.fields.forEach((field) => {
    if (field.type === 'media' && mediaPreview(field)) payload[field.key] = mediaPreview(field)
  })
  if (selectedCollection.value === 'departments') {
    payload.team = payload.team.map((member, index) => ({ ...member, photo: teamPhotoPreview(member, index) || member.photo }))
  }
  previewItem.value = payload
  previewOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewOpen.value = false
  previewItem.value = null
  document.body.style.overflow = ''
}

const handlePreviewKeydown = (event) => {
  if (event.key === 'Escape' && previewOpen.value) closePreview()
}

const saveEntry = async () => {
  saving.value = true
  try {
    const payload = serializePayload()
    const primaryTitle = payload.title || payload.name || payload.label || payload.office || (selectedCollection.value === 'environment' && payload.date ? `Daily environment · ${payload.date}` : '')
    if (!primaryTitle) throw new Error('Add a title or label before saving.')
    if (selectedCollection.value === 'environment' && editor.value.status === 'published') {
      const duplicate = entries.value.find((entry) => entry.id !== editor.value.id && entry.status === 'published' && entry.payload.date === payload.date)
      if (duplicate) throw new Error('A published environment bulletin already exists for this date.')
    }
    if (selectedCollection.value === 'publications' && !payload.url) throw new Error('Upload the publication document before saving.')
    if (selectedCollection.value === 'departments' && editor.value.status === 'published') {
      if (!payload.team?.length) throw new Error('Add at least one team member before publishing this department.')
      if (payload.team.some((member) => !member.name || !member.role || !member.photo)) throw new Error('Every team member needs a photo, name and role before publishing.')
    }
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
  if (mediaPreviews[field.key]?.startsWith('blob:')) URL.revokeObjectURL(mediaPreviews[field.key])
  mediaPreviews[field.key] = URL.createObjectURL(file)
  uploading.value = true
  try {
    editor.value.payload[field.key] = await cmsEntries.upload(file)
    URL.revokeObjectURL(mediaPreviews[field.key])
    delete mediaPreviews[field.key]
    setFeedback('success', 'Media uploaded.')
  } catch (error) {
    setFeedback('error', error.message || 'Media upload failed.')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const addTeamMember = () => {
  editor.value.payload.team.push({ name: '', role: '', photo: '' })
}

const removeTeamMember = (index) => {
  const previewKey = `team-${index}`
  if (mediaPreviews[previewKey]?.startsWith('blob:')) URL.revokeObjectURL(mediaPreviews[previewKey])
  delete mediaPreviews[previewKey]
  editor.value.payload.team.splice(index, 1)
}

const uploadTeamPhoto = async (event, index) => {
  const file = event.target.files?.[0]
  if (!file) return
  const previewKey = `team-${index}`
  if (mediaPreviews[previewKey]?.startsWith('blob:')) URL.revokeObjectURL(mediaPreviews[previewKey])
  mediaPreviews[previewKey] = URL.createObjectURL(file)
  uploading.value = true
  try {
    editor.value.payload.team[index].photo = await cmsEntries.upload(file)
    URL.revokeObjectURL(mediaPreviews[previewKey])
    delete mediaPreviews[previewKey]
    setFeedback('success', 'Team photo uploaded.')
  } catch (error) {
    setFeedback('error', error.message || 'Team photo upload failed.')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const teamPhotoPreview = (member, index) => mediaPreviews[`team-${index}`] || member.photo

const uploadDocument = async (event, field) => {
  const file = event.target.files?.[0]
  if (!file) return
  const selectedFormat = editor.value.payload.format
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!selectedFormat) {
    setFeedback('error', 'Choose the file format before uploading the document.')
    event.target.value = ''
    return
  }
  if (!documentExtensions[selectedFormat]?.includes(extension)) {
    setFeedback('error', `The selected file does not match “${selectedFormat}”.`)
    event.target.value = ''
    return
  }
  uploading.value = true
  try {
    editor.value.payload[field.key] = await cmsEntries.upload(file, { download: file.name })
    editor.value.payload.fileName = file.name
    setFeedback('success', 'Document uploaded.')
  } catch (error) {
    setFeedback('error', error.message || 'Document upload failed.')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const importStarterContent = async () => {
  seeding.value = true
  try {
    const allEntries = await cmsEntries.list()
    const existingKeys = new Set(allEntries.map((entry) => `${entry.collection}:${entry.slug || entry.title}`))
    const missingEntries = createSeedEntries().filter((entry) => !existingKeys.has(`${entry.collection}:${entry.slug || entry.title}`))
    if (!missingEntries.length) throw new Error('All starter content is already available in the CMS.')
    for (const item of missingEntries) await cmsEntries.save(item, session.value.user.id)
    setFeedback('success', `${missingEntries.length} starter ${missingEntries.length === 1 ? 'entry' : 'entries'} imported as drafts.`)
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
onBeforeUnmount(() => {
  clearMediaPreviews()
  window.removeEventListener('keydown', handlePreviewKeydown)
  document.body.style.overflow = ''
})
onMounted(async () => {
  window.addEventListener('keydown', handlePreviewKeydown)
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
        <div v-for="group in pageGroups" :key="group.label" class="admin-nav-group">
          <p>{{ group.label }}</p>
          <button v-for="item in group.items" :key="item.key" type="button" :aria-label="item.label" :aria-current="selectedCollection === item.key ? 'page' : undefined" :class="{ 'is-active': selectedCollection === item.key }" @click="selectCollection(item.key)">
            <component :is="item.icon" :size="21" /><span class="admin-nav-label--desktop">{{ item.label }}</span><span class="admin-nav-label--mobile">{{ item.mobileLabel }}</span>
          </button>
        </div>
      </nav>
      <div class="admin-profile"><div><strong>{{ profile?.full_name || session?.user?.email }}</strong><small>{{ profile?.role || 'staff' }}</small></div><button type="button" aria-label="Sign out" @click="signOut"><PhSignOut :size="19" /></button></div>
    </aside>

    <main class="admin-main">
      <div class="admin-mobile-bar">
        <RouterLink to="/"><img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council" /><span><strong>Content office</strong><small>{{ profile?.role || 'staff' }}</small></span></RouterLink>
        <button type="button" aria-label="Sign out" @click="signOut"><PhSignOut :size="20" /></button>
      </div>
      <header class="admin-toolbar">
        <div><p>{{ definition.page }} / {{ definition.section }}</p><h1>{{ definition.label }}</h1><span>Edit the content shown in this section of the website.</span></div>
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
          <div class="admin-list__heading"><span>Entry</span><span>Status</span><span>{{ definition.chronological ? 'Publication date' : 'Updated' }}</span></div>
          <div v-if="loading" class="admin-state"><PhSpinnerGap class="admin-spin" :size="24" /> Loading content</div>
          <div v-else-if="!entries.length" class="admin-state admin-state--empty">
            <PhFolderOpen :size="30" /><strong>No {{ definition.label.toLowerCase() }} yet</strong><p>Create the first entry or import the website’s starter content.</p>
            <div><button type="button" @click="newEntry"><PhPlus :size="16" /> Create entry</button><button type="button" :disabled="seeding" @click="importStarterContent"><PhCloudArrowUp :size="16" /> {{ seeding ? 'Importing…' : 'Import starter content' }}</button></div>
          </div>
          <button v-for="entry in entries" v-else :key="entry.id" type="button" class="admin-row" :class="{ 'is-selected': editor?.id === entry.id }" @click="editEntry(entry)">
            <span><strong>{{ entry.title }}</strong><small>{{ entry.slug || entry.collection }}</small></span>
            <em :class="`is-${entry.status}`">{{ entry.status }}</em>
            <time>{{ entryDisplayDate(entry) }}</time>
            <PhPencilSimple :size="17" />
          </button>
        </div>

        <form v-if="editor" class="admin-editor" @submit.prevent="saveEntry">
          <div class="admin-editor__heading"><div><p>{{ editor.id ? 'Edit entry' : 'New entry' }}</p><h2>{{ editor.title || 'Untitled' }}</h2></div><button type="button" aria-label="Close editor" @click="editor = null">×</button></div>
          <div class="admin-editor__fields">
            <div v-for="field in definition.fields" :key="field.key" class="admin-field" :class="{ 'is-wide': ['textarea', 'list', 'media', 'team', 'file'].includes(field.type) }">
              <label :for="field.type === 'team' ? undefined : `cms-field-${field.key}`"><span>{{ field.label }} <b v-if="field.required">Required</b></span></label>
              <textarea v-if="field.type === 'textarea'" :id="`cms-field-${field.key}`" v-model="editor.payload[field.key]" rows="4" :required="field.required"></textarea>
              <textarea v-else-if="field.type === 'list'" :id="`cms-field-${field.key}`" v-model="editor.payload[field.key]" rows="5" :required="field.required" placeholder="One item per line"></textarea>
              <select v-else-if="field.type === 'select'" :id="`cms-field-${field.key}`" v-model="editor.payload[field.key]" :required="field.required"><option value="" disabled>Select an option</option><option v-for="option in field.options" :key="option" :value="option">{{ option }}</option></select>
              <section v-else-if="field.type === 'team'" class="admin-team-editor" aria-label="Department team members">
                <div class="admin-team-editor__heading">
                  <p>{{ editor.payload.team.length }} {{ editor.payload.team.length === 1 ? 'team member' : 'team members' }}</p>
                  <button type="button" @click="addTeamMember"><PhPlus :size="17" weight="bold" /> Add team member</button>
                </div>
                <div v-if="!editor.payload.team.length" class="admin-team-empty">
                  <strong>No team members added</strong>
                  <p>Add each person’s photograph, full name and official role.</p>
                  <button type="button" @click="addTeamMember"><PhPlus :size="17" /> Add the first member</button>
                </div>
                <article v-for="(member, index) in editor.payload.team" v-else :key="index" class="admin-team-member">
                  <div class="admin-team-photo">
                    <img v-if="teamPhotoPreview(member, index)" :src="teamPhotoPreview(member, index)" :alt="member.name ? `${member.name} preview` : 'Team member photo preview'" />
                    <div v-else><PhPlus :size="25" /><span>Photo required</span></div>
                    <label>
                      <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadTeamPhoto($event, index)" />
                      <PhCloudArrowUp :size="17" /> {{ member.photo ? 'Replace photo' : 'Choose photo' }}
                    </label>
                  </div>
                  <div class="admin-team-member__fields">
                    <label :for="`team-name-${index}`"><span>Full name <b>Required</b></span><input :id="`team-name-${index}`" v-model="member.name" type="text" required /></label>
                    <label :for="`team-role-${index}`"><span>Official role <b>Required</b></span><input :id="`team-role-${index}`" v-model="member.role" type="text" required /></label>
                  </div>
                  <button class="admin-team-remove" type="button" :aria-label="`Remove ${member.name || 'team member'}`" @click="removeTeamMember(index)"><PhTrash :size="17" /> Remove</button>
                </article>
              </section>
              <div v-else-if="field.type === 'media'" class="admin-media-field">
                <figure v-if="mediaPreview(field)" class="admin-media-preview">
                  <img :src="mediaPreview(field)" :alt="`${field.label} preview`" />
                  <figcaption>
                    <span>{{ uploading ? 'Uploading image…' : 'Website crop preview' }}</span>
                    <button type="button" :disabled="uploading" @click.stop="previewEntry"><PhEye :size="16" /> Preview this section</button>
                  </figcaption>
                </figure>
                <div class="admin-media-controls">
                  <input :id="`cms-field-${field.key}`" v-model="editor.payload[field.key]" type="url" placeholder="Paste an image URL" />
                  <label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="uploadMedia($event, field)" /><PhCloudArrowUp :size="18" /> {{ uploading ? 'Uploading…' : mediaPreview(field) ? 'Replace image' : 'Choose image' }}</label>
                </div>
                <small>Images are cropped to fit the website layout. Use “Preview this section” to check the final placement.</small>
              </div>
              <div v-else-if="field.type === 'file'" class="admin-document-field">
                <div v-if="editor.payload[field.key]" class="admin-document-current">
                  <PhFileText :size="26" />
                  <div><strong>{{ editor.payload.fileName || 'Uploaded document' }}</strong><span>{{ editor.payload.format || 'Document' }} · Ready for download</span></div>
                  <a :href="editor.payload[field.key]" target="_blank" rel="noreferrer">Open file <PhArrowSquareOut :size="16" /></a>
                </div>
                <label class="admin-document-upload">
                  <input :id="`cms-field-${field.key}`" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt" @change="uploadDocument($event, field)" />
                  <PhCloudArrowUp :size="19" />
                  <span><strong>{{ editor.payload[field.key] ? 'Replace document' : 'Choose document' }}</strong><small>PDF, Word, Excel, PowerPoint, CSV or text</small></span>
                </label>
              </div>
              <input v-else :id="`cms-field-${field.key}`" v-model="editor.payload[field.key]" :type="field.type || 'text'" :required="field.required" :min="field.min" :max="field.max" :step="field.step" />
            </div>
            <label v-if="!definition.chronological"><span>Website position</span><input v-model.number="editor.sort_order" type="number" min="0" /><small>Lower numbers appear first.</small></label>
            <label><span>Publishing state</span><select v-model="editor.status"><option value="draft">Draft</option><option value="published" :disabled="!canPublish">Published</option></select><small v-if="!canPublish">A publisher must approve this entry.</small></label>
          </div>
          <footer class="admin-editor__footer">
            <div v-if="editor.id && canDelete" class="admin-delete">
              <button v-if="!deleteConfirmation" type="button" @click="deleteConfirmation = true"><PhTrash :size="16" /> Delete</button>
              <span v-else>Delete permanently? <button type="button" @click="removeEntry">Confirm</button><button type="button" @click="deleteConfirmation = false">Cancel</button></span>
            </div>
            <div class="admin-editor__actions">
              <button class="admin-preview" type="button" :disabled="uploading" @click="previewEntry"><PhEye :size="17" /> Preview changes</button>
              <button class="admin-save" type="submit" :disabled="saving"><PhSpinnerGap v-if="saving" class="admin-spin" :size="17" /><PhCheck v-else :size="17" weight="bold" /> {{ saving ? 'Saving…' : editor.status === 'published' ? 'Publish changes' : 'Save draft' }}</button>
            </div>
          </footer>
        </form>
      </section>
    </main>

    <Teleport to="body">
      <div v-if="previewOpen && previewItem" class="admin-preview-dialog" role="presentation" @click.self="closePreview">
        <section class="admin-preview-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="cms-preview-title">
          <header class="admin-preview-dialog__header">
            <div><p>Website component preview</p><h2 id="cms-preview-title">{{ definition.label }}</h2></div>
            <button type="button" aria-label="Close preview" @click="closePreview">×</button>
          </header>

          <div class="admin-preview-dialog__canvas">
            <article v-if="selectedCollection === 'leadership'" class="cms-preview-leadership">
              <div class="cms-preview-leadership__portrait">
                <img v-if="previewItem.image" :src="previewItem.image" :alt="previewItem.name || previewItem.office || 'Officer photograph'" />
                <span v-else>{{ previewItem.mark || '—' }}</span>
              </div>
              <div><p>{{ previewItem.role || 'Official role' }}</p><h3>{{ previewItem.name || previewItem.office || 'Officer name' }}</h3><span v-if="previewItem.name">{{ previewItem.office }}</span><div>{{ previewItem.description || 'Responsibility summary' }}</div></div>
            </article>

            <article v-else-if="selectedCollection === 'stats'" class="cms-preview-stat">
              <PhSquaresFour :size="26" />
              <strong>{{ previewItem.value || '0' }}</strong>
              <h3>{{ previewItem.label || 'Statistic label' }}</h3>
              <p>{{ previewItem.detail || 'Supporting text will appear here.' }}</p>
            </article>

            <article v-else-if="selectedCollection === 'projects'" class="cms-preview-project">
              <img v-if="previewItem.image" :src="previewItem.image" :alt="previewItem.title || 'Project image preview'" />
              <div v-else class="cms-preview-placeholder">Project image</div>
              <div class="cms-preview-project__body">
                <div><span>{{ previewItem.sector || 'Project sector' }}</span><em>{{ previewItem.status || 'Project status' }}</em></div>
                <h3>{{ previewItem.title || 'Project title' }}</h3>
                <span class="cms-preview-link">Project details <PhArrowSquareOut :size="16" /></span>
              </div>
            </article>

            <article v-else-if="selectedCollection === 'updates'" class="cms-preview-news">
              <img v-if="previewItem.image" :src="previewItem.image" :alt="previewItem.title || 'News image preview'" />
              <div v-else class="cms-preview-placeholder">Featured image</div>
              <div class="cms-preview-news__body">
                <p>{{ previewItem.type || 'Update type' }} <span>/</span> {{ formatCmsDate(previewItem.date) || 'Publication date' }}</p>
                <h3>{{ previewItem.title || 'News headline' }}</h3>
                <div>{{ previewItem.excerpt || 'The update summary will appear here.' }}</div>
                <span class="cms-preview-link">Read the update <PhArrowSquareOut :size="16" /></span>
              </div>
            </article>

            <article v-else-if="selectedCollection === 'environment'" class="cms-preview-environment">
              <header><span>Daily environment</span><strong>{{ previewItem.location || 'Makindye Ssabagabo' }}</strong><time>{{ formatCmsDate(previewItem.date) || 'Bulletin date' }}</time></header>
              <div class="cms-preview-environment__grid">
                <section><PhCloudSun :size="31" /><div><span>Weather</span><strong>{{ previewItem.temperature || '—' }}°</strong><p>{{ previewItem.weatherCondition || 'Weather condition' }}</p></div></section>
                <section><PhLeaf :size="31" /><div><span>Air quality</span><strong>{{ previewItem.aqi || '—' }}</strong><p>{{ airQualityCategory(previewItem.aqi) }}</p></div></section>
              </div>
              <footer><strong>Today’s guidance</strong><p>{{ previewItem.weatherGuidance || 'Weather guidance will appear here.' }}</p><p>{{ previewItem.airQualityGuidance || 'Air-quality guidance will appear here.' }}</p></footer>
            </article>

            <article v-else-if="selectedCollection === 'publications'" class="cms-preview-publication">
              <span><PhFileText :size="24" /></span>
              <div><h3>{{ previewItem.title || 'Document title' }}</h3><p>{{ previewItem.category || 'Category' }} · {{ previewItem.format || 'File format' }}</p></div>
              <PhCloudArrowUp :size="21" />
            </article>

            <article v-else-if="selectedCollection === 'departments'" class="cms-preview-department">
              <header><p>Municipal department</p><h3>{{ previewItem.name || 'Department name' }}</h3><div>{{ previewItem.summary || 'Department introduction' }}</div></header>
              <section><span>Mandate</span><p>{{ previewItem.mandate || 'Department mandate' }}</p></section>
              <section><span>Department team</span>
                <div v-if="previewItem.team?.length" class="cms-preview-team">
                  <article v-for="(member, index) in previewItem.team" :key="index">
                    <img v-if="member.photo" :src="member.photo" :alt="member.name || 'Team member'" /><div v-else class="cms-preview-placeholder">Photo</div>
                    <div><p>{{ member.role || 'Official role' }}</p><h4>{{ member.name || 'Full name' }}</h4></div>
                  </article>
                </div>
                <p v-else class="cms-preview-department__empty">Team members will appear here.</p>
              </section>
            </article>
          </div>

          <footer class="admin-preview-dialog__footer"><p>Preview only · Your changes have not been saved or published.</p><button type="button" @click="closePreview">Back to editing</button></footer>
        </section>
      </div>
    </Teleport>
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
.admin-editor { position: sticky; top: 1rem; }.admin-editor__heading { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; border-bottom: 1px solid rgb(7 59 44 / .1); padding: 1rem 1.25rem; }.admin-editor__heading p { color: #8b6719; font-size: .55rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.admin-editor__heading h2 { max-width: 28rem; margin-top: .3rem; overflow: hidden; font-size: 1.15rem; font-weight: 850; text-overflow: ellipsis; white-space: nowrap; }.admin-editor__heading > button { font-size: 1.6rem; color: #68766e; }.admin-editor__fields { display: grid; max-height: calc(100dvh - 14rem); overflow-y: auto; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; padding: 1.25rem; }.admin-field.is-wide { grid-column: 1 / -1; }.admin-editor label > span { display: flex; align-items: center; justify-content: space-between; margin-bottom: .45rem; font-size: .62rem; font-weight: 800; }.admin-editor label > span b { color: #8b6719; font-size: .49rem; letter-spacing: .08em; text-transform: uppercase; }.admin-editor input,.admin-editor textarea,.admin-editor select { width: 100%; border: 1px solid rgb(7 59 44 / .16); background: #fbfcfa; padding: .72rem .8rem; font-size: .7rem; outline: none; }.admin-editor input,.admin-editor select { min-height: 2.9rem; }.admin-editor textarea { resize: vertical; line-height: 1.55; }.admin-editor input:focus,.admin-editor textarea:focus,.admin-editor select:focus { border-color: #a8791e; box-shadow: 0 0 0 3px rgb(168 121 30 / .1); }.admin-editor label > small { display: block; margin-top: .35rem; color: #8b6719; font-size: .55rem; }.admin-media-field { display: grid; grid-template-columns: 1fr auto; }.admin-media-field > label { display: flex; align-items: center; gap: .4rem; background: #073b2c; padding-inline: .8rem; color: white; font-size: .62rem; font-weight: 800; cursor: pointer; }.admin-media-field > label input { display: none; }
.admin-editor__footer { display: flex; min-height: 4.8rem; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid rgb(7 59 44 / .1); padding: .8rem 1.25rem; }.admin-editor__actions { display: flex; align-items: center; gap: .55rem; margin-left: auto; }.admin-preview,.admin-save { display: flex; min-height: 2.8rem; align-items: center; gap: .45rem; padding: .65rem .85rem; font-size: .65rem; font-weight: 850; }.admin-preview { border: 1px solid rgb(7 59 44 / .2); color: #073b2c; }.admin-save { background: #073b2c; color: white; }.admin-save:disabled { opacity: .55; }.admin-delete > button { display: flex; align-items: center; gap: .4rem; color: #9a3b3b; font-size: .62rem; font-weight: 800; }.admin-delete > span { font-size: .6rem; }.admin-delete > span button { margin-left: .45rem; color: #9a3b3b; font-weight: 850; }.admin-spin { animation: admin-spin .8s linear infinite; }

/* Readability and page-order pass */
.admin-cms { grid-template-columns: 19rem minmax(0, 1fr); }
.admin-sidebar { padding: 1.35rem; }
.admin-brand { gap: .9rem; padding: .55rem .5rem 1.4rem; }
.admin-brand img { width: 3.25rem; height: 3.25rem; }
.admin-brand small { font-size: .7rem; }
.admin-brand strong { margin-top: .2rem; font-size: .95rem; }
.admin-sidebar nav { margin-top: 1.6rem; overflow-y: auto; }
.admin-nav-group + .admin-nav-group { margin-top: 1.5rem; }
.admin-nav-group > p { padding-inline: .85rem; color: rgb(255 255 255 / .48); font-size: .7rem; font-weight: 800; letter-spacing: .08em; }
.admin-sidebar nav button { min-height: 3.35rem; gap: .8rem; padding: .75rem .85rem; font-size: .88rem; }
.admin-profile strong { font-size: .8rem; }
.admin-profile small { font-size: .68rem; }
.admin-nav-label--mobile,.admin-mobile-bar { display: none; }
.admin-main { padding: clamp(1.5rem, 3vw, 3.5rem); }
.admin-toolbar p { font-size: .72rem; letter-spacing: .1em; }
.admin-toolbar h1 { margin-top: .55rem; font-size: clamp(2.35rem, 3.5vw, 3.75rem); }
.admin-toolbar > div > span { display: block; margin-top: .7rem; color: #66766e; font-size: .9rem; }
.admin-toolbar__actions a,.admin-toolbar__actions button { min-height: 3.2rem; padding: .8rem 1rem; font-size: .82rem; }
.admin-feedback { font-size: .84rem; }
.admin-summary { margin-top: 2.4rem; }
.admin-summary > div { min-height: 6rem; padding: 1.1rem 1.4rem; }
.admin-summary span { font-size: .8rem; }
.admin-summary strong { font-size: 2rem; }
.admin-workspace { margin-top: 1.75rem; gap: 1.25rem; }
.admin-workspace.has-editor { grid-template-columns: minmax(20rem, .72fr) minmax(36rem, 1.28fr); }
.admin-list__heading,.admin-row { grid-template-columns: minmax(0, 1fr) 6.25rem 8.5rem 1.5rem; }
.admin-list__heading { min-height: 3.25rem; padding: .75rem 1.15rem; font-size: .68rem; }
.admin-row { min-height: 5.4rem; padding: .9rem 1.15rem; }
.admin-row strong { font-size: .88rem; }
.admin-row small { margin-top: .35rem; font-size: .7rem; }
.admin-row em { padding: .38rem .5rem; font-size: .64rem; }
.admin-row time { font-size: .72rem; line-height: 1.35; }
.admin-state { font-size: .88rem; }
.admin-state--empty strong { font-size: 1.1rem; }
.admin-state--empty p { font-size: .8rem; line-height: 1.55; }
.admin-state--empty button { padding: .7rem .85rem; font-size: .78rem; }
.admin-editor__heading { min-height: 6rem; padding: 1.2rem 1.5rem; }
.admin-editor__heading p { font-size: .68rem; }
.admin-editor__heading h2 { margin-top: .35rem; font-size: 1.4rem; }
.admin-editor__fields { max-height: calc(100dvh - 16rem); gap: 1.3rem; padding: 1.5rem; }
.admin-editor label > span { margin-bottom: .6rem; font-size: .82rem; }
.admin-editor label > span b { font-size: .6rem; }
.admin-editor input,.admin-editor textarea,.admin-editor select { padding: .85rem .95rem; font-size: .92rem; }
.admin-editor input,.admin-editor select { min-height: 3.35rem; }
.admin-editor textarea { min-height: 8rem; line-height: 1.65; }
.admin-editor label > small { margin-top: .45rem; font-size: .7rem; }
.admin-media-field > label { padding-inline: 1rem; font-size: .78rem; }
.admin-media-field { display: block; }
.admin-media-preview { overflow: hidden; background: #e7ebe6; box-shadow: inset 0 0 0 1px rgb(7 59 44 / .1); }
.admin-media-preview img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.admin-media-preview figcaption { display: flex; min-height: 3.4rem; align-items: center; justify-content: space-between; gap: 1rem; padding: .7rem .9rem; background: #f1f4ef; }
.admin-media-preview figcaption > span { color: #5f7067; font-size: .75rem; font-weight: 750; }
.admin-media-preview figcaption button { display: inline-flex; min-height: 2.25rem; align-items: center; gap: .4rem; padding: .45rem .65rem; background: #fff; color: #073b2c; font-size: .75rem; font-weight: 850; box-shadow: inset 0 0 0 1px rgb(7 59 44 / .16); transition: background-color 220ms, color 220ms, transform 220ms; }
.admin-media-preview figcaption button:hover { background: #073b2c; color: white; }
.admin-media-preview figcaption button:active { transform: scale(.98); }
.admin-media-preview figcaption button:disabled { opacity: .55; }
.admin-media-controls { display: grid; margin-top: .8rem; grid-template-columns: minmax(0, 1fr) auto; }
.admin-media-controls > label { display: flex; min-height: 3.35rem; align-items: center; gap: .45rem; background: #073b2c; padding-inline: 1rem; color: white; font-size: .78rem; font-weight: 850; cursor: pointer; }
.admin-media-controls > label input { display: none; }
.admin-media-field > small { display: block; margin-top: .55rem; color: #68776f; font-size: .72rem; line-height: 1.5; }
.admin-team-editor { overflow: hidden; background: #f3f5f1; box-shadow: inset 0 0 0 1px rgb(7 59 44 / .1); }
.admin-team-editor__heading { display: flex; min-height: 4.5rem; align-items: center; justify-content: space-between; gap: 1rem; padding: .85rem 1rem; background: #e8ede7; }
.admin-team-editor__heading p { color: #53655c; font-size: .8rem; font-weight: 800; }
.admin-team-editor__heading button,.admin-team-empty button { display: inline-flex; min-height: 2.65rem; align-items: center; gap: .45rem; background: #073b2c; padding: .6rem .8rem; color: white; font-size: .78rem; font-weight: 850; }
.admin-team-empty { display: flex; min-height: 12rem; align-items: center; justify-content: center; flex-direction: column; padding: 2rem; text-align: center; }
.admin-team-empty strong { font-size: 1rem; }.admin-team-empty p { margin-top: .4rem; color: #69786f; font-size: .8rem; }.admin-team-empty button { margin-top: 1rem; }
.admin-team-member { display: grid; min-width: 0; grid-template-columns: 9.5rem minmax(0, 1fr) auto; gap: 1.1rem; align-items: center; padding: 1rem; border-top: 1px solid rgb(7 59 44 / .1); background: white; }
.admin-team-photo { position: relative; overflow: hidden; background: #dfe6df; }
.admin-team-photo > img,.admin-team-photo > div { display: flex; width: 100%; aspect-ratio: 4 / 5; align-items: center; justify-content: center; flex-direction: column; gap: .45rem; object-fit: cover; color: #62736a; }
.admin-team-photo > div span { font-size: .68rem; font-weight: 800; }
.admin-team-photo > label { position: absolute; right: 0; bottom: 0; left: 0; display: flex; min-height: 2.7rem; align-items: center; justify-content: center; gap: .4rem; margin: 0; background: rgb(7 59 44 / .92); color: white; font-size: .7rem; font-weight: 850; cursor: pointer; }
.admin-team-photo > label input { display: none; }
.admin-team-member__fields { display: grid; min-width: 0; gap: 1rem; }
.admin-team-member__fields label > span { margin-bottom: .45rem; }
.admin-team-remove { display: inline-flex; align-items: center; gap: .4rem; align-self: end; padding: .65rem .2rem; color: #963b3b; font-size: .72rem; font-weight: 850; }
.admin-document-field { display: grid; gap: .8rem; }
.admin-document-current { display: grid; min-width: 0; grid-template-columns: auto minmax(0, 1fr) auto; gap: .85rem; align-items: center; background: #edf2ed; padding: 1rem; color: #073b2c; }
.admin-document-current strong,.admin-document-current span { display: block; min-width: 0; overflow-wrap: anywhere; }.admin-document-current strong { font-size: .86rem; }.admin-document-current span { margin-top: .2rem; color: #68776f; font-size: .7rem; }
.admin-document-current > a { display: inline-flex; min-height: 2.5rem; align-items: center; gap: .4rem; padding: .55rem .7rem; background: white; color: #073b2c; font-size: .74rem; font-weight: 850; box-shadow: inset 0 0 0 1px rgb(7 59 44 / .14); }
.admin-document-upload { display: flex; min-height: 5rem; align-items: center; justify-content: center; gap: .75rem; border: 1px dashed rgb(7 59 44 / .32); background: #fbfcfa; padding: 1rem; color: #073b2c; cursor: pointer; transition: background-color 220ms, border-color 220ms; }
.admin-document-upload:hover { border-color: #8b6719; background: #f5f3e9; }.admin-document-upload > input { display: none; }.admin-document-upload > span { margin: 0; }.admin-document-upload strong,.admin-document-upload small { display: block; }.admin-document-upload strong { font-size: .82rem; }.admin-document-upload small { margin-top: .25rem; color: #6b7871; font-size: .7rem; font-weight: 600; }
.admin-editor__footer { min-height: 5.5rem; padding: 1rem 1.5rem; }
.admin-preview,.admin-save { min-height: 3.2rem; padding: .8rem 1rem; font-size: .8rem; }
.admin-delete > button,.admin-delete > span { font-size: .76rem; }
.admin-preview:disabled { cursor: wait; opacity: .55; }
.admin-preview-dialog { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; background: rgb(4 31 23 / .72); padding: 1.25rem; backdrop-filter: blur(10px); }
.admin-preview-dialog__panel { display: grid; width: min(100%, 62rem); max-height: calc(100dvh - 2.5rem); overflow: hidden; grid-template-rows: auto minmax(0, 1fr) auto; background: #f7f8f5; color: #13231d; box-shadow: 0 2rem 6rem rgb(3 26 19 / .35); }
.admin-preview-dialog__header { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgb(7 59 44 / .12); padding: 1.15rem 1.4rem; background: white; }
.admin-preview-dialog__header > div { min-width: 0; }.admin-preview-dialog__header p { color: #8b6719; font-size: .66rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.admin-preview-dialog__header h2 { margin-top: .25rem; overflow: hidden; font-size: 1.25rem; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }.admin-preview-dialog__header > button { display: grid; width: 2.7rem; height: 2.7rem; flex: none; place-items: center; color: #53645b; font-size: 1.8rem; }
.admin-preview-dialog__canvas { overflow-y: auto; overscroll-behavior: contain; padding: clamp(1rem, 4vw, 3rem); background: #e9ede8; }
.admin-preview-dialog__canvas > article { margin-inline: auto; }
.admin-preview-dialog__footer { display: flex; min-height: 4.5rem; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid rgb(7 59 44 / .12); padding: .85rem 1.4rem; background: white; }.admin-preview-dialog__footer p { color: #68766f; font-size: .75rem; }.admin-preview-dialog__footer button { min-height: 2.8rem; background: #073b2c; padding: .65rem .9rem; color: white; font-size: .78rem; font-weight: 850; }
.cms-preview-placeholder { display: grid; place-items: center; background: #dfe6df; color: #65756d; font-size: .78rem; font-weight: 800; }
.cms-preview-link { display: inline-flex; align-items: center; gap: .45rem; margin-top: auto; padding-top: 1.4rem; color: #17634c; font-size: .8rem; font-weight: 850; }
.cms-preview-stat { display: flex; width: min(100%, 20rem); min-height: 19rem; align-items: center; flex-direction: column; background: #073b2c; padding: 2rem 1.25rem; color: white; text-align: center; }.cms-preview-stat > svg { color: #e8c774; }.cms-preview-stat strong { max-width: 100%; margin-top: 1.4rem; overflow-wrap: anywhere; font-size: clamp(2.4rem, 8vw, 4rem); font-weight: 900; line-height: 1; }.cms-preview-stat h3 { margin-top: 1rem; overflow-wrap: anywhere; font-size: .95rem; font-weight: 850; }.cms-preview-stat p { margin-top: .45rem; overflow-wrap: anywhere; color: rgb(255 255 255 / .6); font-size: .76rem; line-height: 1.5; }
.cms-preview-leadership { display: grid; width: min(100%, 25rem); overflow: hidden; background: #f3f1e8; box-shadow: 0 1rem 3rem rgb(7 59 44 / .12); }.cms-preview-leadership__portrait { display: grid; aspect-ratio: 4 / 3; place-items: center; overflow: hidden; background: #a8791e; color: #102d24; }.cms-preview-leadership__portrait img { width: 100%; height: 100%; object-fit: cover; }.cms-preview-leadership__portrait > span { font-size: 3.5rem; font-weight: 900; }.cms-preview-leadership > div:last-child { padding: 1.5rem; }.cms-preview-leadership > div:last-child > p { color: #8b6719; font-size: .68rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.cms-preview-leadership h3 { margin-top: .75rem; overflow-wrap: anywhere; font-size: 1.6rem; font-weight: 900; line-height: 1.08; }.cms-preview-leadership > div:last-child > span { display: block; margin-top: .55rem; color: #53655c; font-size: .78rem; font-weight: 800; }.cms-preview-leadership > div:last-child > div { margin-top: 1rem; color: #65736c; font-size: .8rem; line-height: 1.6; }
.cms-preview-environment { width: min(100%, 48rem); overflow: hidden; border-radius: .9rem; background: white; box-shadow: 0 1rem 3rem rgb(7 59 44 / .12); }.cms-preview-environment > header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.2rem; background: #073b2c; color: white; }.cms-preview-environment > header span { color: #e8c774; font-size: .62rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.cms-preview-environment > header strong { font-size: .78rem; }.cms-preview-environment > header time { color: rgb(255 255 255 / .55); font-size: .62rem; }.cms-preview-environment__grid { display: grid; grid-template-columns: 1fr 1fr; }.cms-preview-environment__grid > section { display: flex; min-height: 12rem; align-items: center; gap: 1.1rem; padding: 1.5rem; }.cms-preview-environment__grid > section:first-child { background: #3e6872; color: white; }.cms-preview-environment__grid > section:last-child { color: #2f6f50; }.cms-preview-environment__grid span { display: block; font-size: .58rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }.cms-preview-environment__grid strong { display: block; margin-top: .45rem; font-size: 3.4rem; font-weight: 900; line-height: .9; }.cms-preview-environment__grid p { margin-top: .6rem; font-size: .72rem; font-weight: 800; }.cms-preview-environment > footer { padding: 1.1rem 1.25rem; background: #f3f1e8; }.cms-preview-environment > footer strong { font-size: .65rem; text-transform: uppercase; }.cms-preview-environment > footer p { margin-top: .4rem; color: #5e7067; font-size: .72rem; line-height: 1.5; }
.cms-preview-project { display: flex; width: min(100%, 28rem); min-width: 0; overflow: hidden; flex-direction: column; background: #f6f8f6; box-shadow: 0 1rem 3rem rgb(7 59 44 / .12); }.cms-preview-project > img,.cms-preview-project > .cms-preview-placeholder { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }.cms-preview-project__body { display: flex; min-width: 0; flex: 1; flex-direction: column; padding: 1.5rem; }.cms-preview-project__body > div { display: flex; min-width: 0; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .65rem; }.cms-preview-project__body > div span { color: #17634c; font-size: .68rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }.cms-preview-project__body > div em { background: #e2ebe5; padding: .3rem .5rem; color: #104b3a; font-size: .65rem; font-style: normal; font-weight: 800; }.cms-preview-project h3 { margin-top: 1rem; overflow-wrap: anywhere; font-size: 1.5rem; font-weight: 900; line-height: 1.12; }
.cms-preview-news { display: grid; width: min(100%, 44rem); min-width: 0; overflow: hidden; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: white; box-shadow: 0 1rem 3rem rgb(7 59 44 / .1); }.cms-preview-news > img,.cms-preview-news > .cms-preview-placeholder { width: 100%; height: 100%; min-height: 24rem; object-fit: cover; }.cms-preview-news__body { display: flex; min-width: 0; justify-content: center; flex-direction: column; padding: clamp(1.5rem, 4vw, 2.5rem); }.cms-preview-news__body > p { overflow-wrap: anywhere; color: #8b6719; font-size: .65rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }.cms-preview-news__body h3 { margin-top: 1rem; overflow-wrap: anywhere; font-size: clamp(1.5rem, 4vw, 2.1rem); font-weight: 900; line-height: 1.08; }.cms-preview-news__body > div { margin-top: 1rem; overflow-wrap: anywhere; color: #617168; font-size: .85rem; line-height: 1.65; }
.cms-preview-publication { display: grid; width: min(100%, 42rem); min-width: 0; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: center; background: white; padding: 1.25rem; box-shadow: 0 1rem 3rem rgb(7 59 44 / .08); }.cms-preview-publication > span { display: grid; width: 3rem; height: 3rem; place-items: center; border-radius: 50%; background: #fff5e9; color: #a94d0b; }.cms-preview-publication h3,.cms-preview-publication p { overflow-wrap: anywhere; }.cms-preview-publication h3 { font-size: .95rem; font-weight: 900; }.cms-preview-publication p { margin-top: .25rem; color: #738078; font-size: .72rem; font-weight: 700; }.cms-preview-publication > svg { color: #698078; }
.cms-preview-department { width: min(100%, 50rem); min-width: 0; overflow: hidden; background: white; box-shadow: 0 1rem 3rem rgb(7 59 44 / .1); }.cms-preview-department > header { background: #073b2c; padding: clamp(1.5rem, 5vw, 3.5rem); color: white; }.cms-preview-department > header p,.cms-preview-department > section > span { color: #e8c774; font-size: .68rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.cms-preview-department > header h3 { margin-top: .8rem; overflow-wrap: anywhere; font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; line-height: 1; }.cms-preview-department > header div { max-width: 42rem; margin-top: 1rem; overflow-wrap: anywhere; color: rgb(255 255 255 / .68); font-size: .9rem; line-height: 1.7; }.cms-preview-department > section { padding: clamp(1.5rem, 4vw, 2.5rem); }.cms-preview-department > section + section { border-top: 1px solid rgb(7 59 44 / .1); }.cms-preview-department > section > p { margin-top: .8rem; overflow-wrap: anywhere; color: #627168; font-size: .88rem; line-height: 1.7; }.cms-preview-team { display: grid; margin-top: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: 1rem; }.cms-preview-team article { min-width: 0; overflow: hidden; background: #eef3ef; }.cms-preview-team article > img,.cms-preview-team article > .cms-preview-placeholder { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }.cms-preview-team article > div:last-child { border-top: 3px solid #17634c; padding: .85rem; }.cms-preview-team p,.cms-preview-team h4 { overflow-wrap: anywhere; }.cms-preview-team p { color: #17634c; font-size: .6rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }.cms-preview-team h4 { margin-top: .3rem; font-size: .9rem; font-weight: 900; }.cms-preview-department__empty { background: #eef3ef; padding: 1rem; }
@keyframes admin-spin { to { transform: rotate(360deg); } }
@media (max-width: 1300px) { .admin-workspace.has-editor { grid-template-columns: 1fr; }.admin-editor { position: static; }.admin-editor__fields { max-height: none; } }
@media (max-width: 1050px) { .admin-workspace.has-editor { grid-template-columns: 1fr; }.admin-editor { position: static; }.admin-editor__fields { max-height: none; } }
@media (max-width: 760px) { .admin-cms { grid-template-columns: 1fr; }.admin-sidebar { position: static; height: auto; padding: .8rem; }.admin-sidebar nav { display: flex; overflow-x: auto; margin-top: .8rem; }.admin-sidebar nav > p { display: none; }.admin-sidebar nav button { width: max-content; flex-shrink: 0; }.admin-profile { margin-top: .8rem; padding: .8rem .45rem 0; }.admin-main { padding: 1rem; }.admin-toolbar { align-items: flex-start; flex-direction: column; }.admin-toolbar__actions { width: 100%; }.admin-toolbar__actions a,.admin-toolbar__actions button { flex: 1; justify-content: center; }.admin-summary > div { min-height: 4.5rem; flex-direction: column; justify-content: center; gap: .35rem; }.admin-workspace.has-editor { display: block; }.admin-list__heading { display: none; }.admin-row { grid-template-columns: minmax(0, 1fr) auto 1.2rem; }.admin-row time { display: none; }.admin-editor { margin-top: 1rem; }.admin-editor__fields { grid-template-columns: 1fr; }.admin-field.is-wide { grid-column: auto; } }
@media (max-width: 760px) { .admin-editor__footer { align-items: stretch; flex-direction: column; }.admin-editor__actions { width: 100%; margin-left: 0; }.admin-editor__actions button { flex: 1; justify-content: center; } }
@media (max-width: 560px) { .admin-media-preview figcaption { align-items: flex-start; flex-direction: column; }.admin-media-controls { grid-template-columns: 1fr; }.admin-media-controls > label { justify-content: center; } }
@media (max-width: 700px) { .admin-team-editor__heading { align-items: stretch; flex-direction: column; }.admin-team-editor__heading button { justify-content: center; }.admin-team-member { grid-template-columns: 7.5rem minmax(0, 1fr); }.admin-team-remove { grid-column: 1 / -1; justify-self: end; }.admin-document-current { grid-template-columns: auto minmax(0, 1fr); }.admin-document-current > a { grid-column: 1 / -1; justify-content: center; } }
@media (max-width: 460px) { .admin-team-member { grid-template-columns: 1fr; }.admin-team-photo { width: min(100%, 12rem); }.admin-team-remove { grid-column: auto; justify-self: start; } }

/* Mobile CMS: fixed bottom collection navigation and overflow-safe editors. */
@media (max-width: 760px) {
  .admin-cms { width: 100%; min-width: 0; overflow-x: clip; }
  .admin-sidebar {
    position: fixed;
    z-index: 30;
    right: 0;
    bottom: 0;
    left: 0;
    top: auto;
    display: block;
    width: 100%;
    height: auto;
    padding: .45rem .35rem calc(.45rem + env(safe-area-inset-bottom));
    background: rgb(8 47 37 / .98);
    box-shadow: 0 -1rem 2.5rem rgb(4 31 23 / .2), inset 0 1px 0 rgb(255 255 255 / .1);
    backdrop-filter: blur(16px);
  }
  .admin-brand,.admin-profile,.admin-nav-group > p,.admin-nav-label--desktop { display: none; }
  .admin-nav-label--mobile { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .admin-sidebar nav {
    display: grid;
    overflow: visible;
    width: 100%;
    margin: 0;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: .2rem;
  }
  .admin-nav-group { display: contents; }
  .admin-nav-group + .admin-nav-group { margin: 0; }
  .admin-sidebar nav button {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 4rem;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: .3rem;
    margin: 0;
    padding: .45rem .2rem;
    border-radius: .55rem;
    color: rgb(255 255 255 / .58);
    font-size: .64rem;
    line-height: 1;
    text-align: center;
    transform: none;
  }
  .admin-sidebar nav button:hover { transform: none; }
  .admin-sidebar nav button.is-active { background: rgb(255 255 255 / .11); color: #f4d98f; }
  .admin-sidebar nav button svg { width: 1.25rem; height: 1.25rem; flex: none; }

  .admin-main { width: 100%; min-width: 0; padding: .85rem .85rem calc(6.2rem + env(safe-area-inset-bottom)); }
  .admin-mobile-bar { display: flex; min-height: 3.5rem; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.35rem; border-bottom: 1px solid rgb(7 59 44 / .12); padding: 0 .15rem .8rem; }
  .admin-mobile-bar > a { display: flex; min-width: 0; align-items: center; gap: .65rem; color: #13231d; }
  .admin-mobile-bar img { width: 2.45rem; height: 2.45rem; flex: none; object-fit: contain; }
  .admin-mobile-bar strong,.admin-mobile-bar small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .admin-mobile-bar strong { font-size: .84rem; }.admin-mobile-bar small { margin-top: .12rem; color: #8b6719; font-size: .65rem; text-transform: capitalize; }
  .admin-mobile-bar > button { display: grid; width: 2.65rem; height: 2.65rem; flex: none; place-items: center; border: 1px solid rgb(7 59 44 / .15); color: #29433a; }

  .admin-toolbar { min-width: 0; gap: 1.25rem; }
  .admin-toolbar > div:first-child { min-width: 0; }
  .admin-toolbar p { overflow-wrap: anywhere; font-size: .66rem; line-height: 1.4; }
  .admin-toolbar h1 { max-width: 100%; overflow-wrap: anywhere; font-size: clamp(2rem, 10vw, 2.8rem); line-height: .98; }
  .admin-toolbar > div > span { font-size: .82rem; line-height: 1.5; }
  .admin-toolbar__actions { display: grid; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-toolbar__actions a,.admin-toolbar__actions button { min-width: 0; min-height: 3rem; justify-content: center; padding: .7rem .55rem; font-size: .75rem; text-align: center; }
  .admin-toolbar__actions a { overflow-wrap: anywhere; }

  .admin-feedback { right: .75rem; left: .75rem; width: auto; max-width: none; font-size: .78rem; line-height: 1.4; }
  .admin-summary { margin-top: 1.5rem; }
  .admin-summary > div { min-width: 0; min-height: 4.75rem; padding: .65rem .35rem; text-align: center; }
  .admin-summary span { overflow-wrap: anywhere; font-size: .68rem; line-height: 1.25; }
  .admin-summary strong { font-size: 1.55rem; }
  .admin-workspace { min-width: 0; margin-top: 1rem; }
  .admin-list,.admin-editor { width: 100%; min-width: 0; }
  .admin-row { min-width: 0; min-height: 4.8rem; gap: .65rem; padding: .75rem .8rem; }
  .admin-row > span { min-width: 0; }.admin-row strong { font-size: .82rem; }.admin-row small { font-size: .66rem; }
  .admin-row em { font-size: .58rem; }
  .admin-state { min-width: 0; padding: 1.5rem 1rem; }
  .admin-state--empty > div { width: 100%; align-items: stretch; flex-direction: column; }
  .admin-state--empty button { justify-content: center; }

  .admin-editor { overflow: hidden; }
  .admin-editor__heading { min-width: 0; min-height: 5rem; padding: 1rem; }
  .admin-editor__heading > div { min-width: 0; }.admin-editor__heading h2 { max-width: calc(100vw - 6rem); font-size: 1.15rem; }
  .admin-editor__fields { min-width: 0; gap: 1.05rem; padding: 1rem; }
  .admin-field,.admin-field > * { min-width: 0; max-width: 100%; }
  .admin-editor input,.admin-editor textarea,.admin-editor select { min-width: 0; max-width: 100%; font-size: 1rem; }
  .admin-editor textarea { min-height: 7rem; }
  .admin-editor__footer { min-width: 0; padding: 1rem; }
  .admin-delete { min-width: 0; }.admin-delete > span { display: flex; flex-wrap: wrap; gap: .35rem; line-height: 1.5; }
  .admin-editor__actions { min-width: 0; }
  .admin-editor__actions button { min-width: 0; padding-inline: .55rem; font-size: .74rem; text-align: center; }
  .admin-media-preview img { max-height: 22rem; }
  .admin-document-upload { min-width: 0; }
  .admin-preview-dialog { align-items: end; padding: 0; }
  .admin-preview-dialog__panel { width: 100%; max-height: 100dvh; }
  .admin-preview-dialog__header { padding: .9rem 1rem; }
  .admin-preview-dialog__header h2 { font-size: 1.05rem; }
  .admin-preview-dialog__canvas { padding: .85rem; }
  .admin-preview-dialog__footer { align-items: stretch; flex-direction: column; padding: .85rem 1rem calc(.85rem + env(safe-area-inset-bottom)); }
  .admin-preview-dialog__footer button { width: 100%; }
  .cms-preview-news { grid-template-columns: 1fr; }
  .cms-preview-news > img,.cms-preview-news > .cms-preview-placeholder { min-height: 0; aspect-ratio: 16 / 10; }
  .cms-preview-news__body { padding: 1.25rem; }
  .cms-preview-department > header { padding: 1.5rem 1.25rem; }
  .cms-preview-department > section { padding: 1.25rem; }
}

@media (max-width: 420px) {
  .admin-toolbar__actions { grid-template-columns: 1fr; }
  .admin-editor__actions { align-items: stretch; flex-direction: column; }
  .admin-editor__actions button { width: 100%; flex: none; }
  .admin-summary span { font-size: .62rem; }
}
</style>
