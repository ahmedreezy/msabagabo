// The department's existing fields remain intact; only this optional profile is new.
export const educationGroups = [
  { key: 'guidance', title: 'Services and guidance', singular: 'service', fields: [
    { key: 'title', label: 'Service title', required: true },
    { key: 'audience', label: 'Who this helps', required: true },
    { key: 'steps', label: 'Next steps (one per line)', type: 'lines', required: true },
    { key: 'responsible', label: 'Responsible office', required: true },
  ] },
  { key: 'schools', title: 'School directory', singular: 'school', fields: [
    { key: 'name', label: 'School name', required: true },
    { key: 'level', label: 'Level', options: ['Primary', 'Secondary'], required: true },
    { key: 'programme', label: 'Programme', options: ['UPE', 'USE', 'Partnership'], required: true },
    { key: 'location', label: 'Location / division' },
    { key: 'phone', label: 'School telephone', type: 'tel' },
    { key: 'email', label: 'School email', type: 'email' },
  ] },
  { key: 'units', title: 'Responsibilities and units', singular: 'unit', fields: [
    { key: 'title', label: 'Unit or responsibility', required: true },
    { key: 'description', label: 'What this unit does', type: 'textarea', required: true },
  ] },
  { key: 'contacts', title: 'Verified contact routes', singular: 'contact', fields: [
    { key: 'label', label: 'Office or contact label', required: true },
    { key: 'kind', label: 'Contact type', options: ['Email', 'Telephone'], required: true },
    { key: 'value', label: 'Email address or telephone number', required: true },
  ] },
  { key: 'activities', title: 'Projects and activities', singular: 'activity', fields: [
    { key: 'title', label: 'Activity title', required: true },
    { key: 'date', label: 'Date of this update', type: 'date', required: true },
    { key: 'description', label: 'Dated progress update', type: 'textarea', required: true },
    { key: 'image', label: 'Photograph', type: 'image' },
    { key: 'caption', label: 'Photograph caption / description' },
  ] },
  { key: 'documents', title: 'Documents and guidance', singular: 'document', fields: [
    { key: 'title', label: 'Document title', required: true },
    { key: 'url', label: 'Document or guidance URL', type: 'document', required: true },
    { key: 'format', label: 'Format', options: ['PDF', 'Word', 'Excel', 'Web page', 'Other'], required: true },
  ] },
]

const copy = (value) => JSON.parse(JSON.stringify(value))
export const safeLink = (value) => {
  if (typeof value !== 'string' || /[\s\\]/.test(value)) return ''
  if (/^\/(?!\/)/.test(value)) return value
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? value : ''
  } catch { return '' }
}
export const emailLink = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '') ? `mailto:${value}` : ''
export const phoneLink = (value) => {
  if (!/^\+?[\d ()-]{6,24}$/.test(value || '')) return ''
  const number = value.replace(/[^\d+]/g, '')
  return /^\+?\d{6,15}$/.test(number) ? `tel:${number}` : ''
}

export const emptyEducationProfile = () => ({
  version: 1, approved: false, reviewNotes: '',
  ...Object.fromEntries(educationGroups.map(({ key }) => [key, []])),
})

export const normalizeEducationProfile = (value) => {
  const profile = { ...emptyEducationProfile(), ...copy(value || {}) }
  educationGroups.forEach(({ key }) => {
    profile[key] = Array.isArray(profile[key]) ? profile[key].filter((item) => item && typeof item === 'object').map((item, index) => ({
      ...item, id: item.id || `${key}-${index}`, reviewed: item.reviewed === true,
      ...(key === 'guidance' ? { steps: Array.isArray(item.steps) ? item.steps : String(item.steps || '').split('\n').filter(Boolean) } : {}),
    })) : []
  })
  profile.approved = profile.approved === true
  return profile
}

export const educationPublicationIssues = (department) => {
  if (!department.educationProfile) return []
  const profile = normalizeEducationProfile(department.educationProfile)
  const issues = []
  if (!department.name?.trim() || !department.summary?.trim()) issues.push('Add the department name and introduction before publishing.')
  if (department.slug !== 'education-sports') issues.push('The Education profile belongs to education-sports.')
  if (!profile.approved) issues.push('Review and approve the department introduction, mandate, authority and staff.')
  if (profile.reviewNotes?.trim()) issues.push('Resolve and clear the overall editorial review notes.')
  educationGroups.forEach(({ key, title, fields }) => profile[key].forEach((item, index) => {
    const label = `${title}, entry ${index + 1}`
    if (!item.reviewed || item.reviewNote?.trim()) issues.push(`${label}: resolve the review note and mark the entry verified.`)
    if (!safeLink(item.sourceUrl)) issues.push(`${label}: add a valid source reference.`)
    fields.forEach((field) => {
      const value = item[field.key]
      if (field.required && (Array.isArray(value) ? !value.some((line) => String(line).trim()) : !String(value || '').trim())) issues.push(`${label}: ${field.label} is required.`)
      if (value && field.options && !field.options.includes(value)) issues.push(`${label}: choose a valid ${field.label.toLowerCase()}.`)
      if (value && ['image', 'document'].includes(field.type) && !safeLink(value)) issues.push(`${label}: ${field.label} must be an HTTP(S) URL or local path.`)
    })
    if (key === 'activities' && item.image && !item.caption?.trim()) issues.push(`${label}: add a photograph caption.`)
    if (key === 'activities' && item.date && (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)) || new Date(item.date).toISOString().slice(0, 10) !== item.date)) issues.push(`${label}: enter a valid update date.`)
    if (key === 'schools' && item.phone && !phoneLink(item.phone)) issues.push(`${label}: enter a valid telephone number.`)
    if (key === 'schools' && item.email && !emailLink(item.email)) issues.push(`${label}: enter a valid email address.`)
    if (key === 'contacts' && !(item.kind === 'Email' ? emailLink(item.value) : item.kind === 'Telephone' && phoneLink(item.value))) issues.push(`${label}: enter a valid contact value.`)
  }))
  ;(department.team || []).forEach((member, index) => {
    if (!member.name?.trim() || !member.role?.trim()) issues.push(`Team member ${index + 1}: name and role are required.`)
    if (member.photo && !safeLink(member.photo)) issues.push(`Team member ${index + 1}: use a valid photograph URL.`)
  })
  return issues
}

// Only approved content can leave the editorial view. Never copy review metadata.
export const publicEducationProfile = (department) => {
  if (!department.educationProfile || educationPublicationIssues(department).length) return null
  const profile = normalizeEducationProfile(department.educationProfile)
  return Object.fromEntries(educationGroups.map(({ key, fields }) => [key, profile[key].map((item) => Object.fromEntries(
    ['id', ...fields.map(({ key: fieldKey }) => fieldKey)].map((fieldKey) => [fieldKey, item[fieldKey]]),
  ))]))
}

export const filterSchools = (schools, query = '', level = '', programme = '') => {
  const term = query.trim().toLocaleLowerCase()
  return schools.filter((school) => (!term || String(school.name || '').toLocaleLowerCase().includes(term)) && (!level || school.level === level) && (!programme || school.programme === programme))
}

export const moveEducationEntry = (profile, key, index, direction) => {
  const next = normalizeEducationProfile(profile)
  const target = index + direction
  if (!next[key] || target < 0 || target >= next[key].length) return next
  ;[next[key][index], next[key][target]] = [next[key][target], next[key][index]]
  return next
}
