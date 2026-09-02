import { reactive } from 'vue'
import {
  departments as fallbackDepartments,
  projects as fallbackProjects,
  publications as fallbackPublications,
  environmentBulletins as fallbackEnvironment,
  homepageStats as fallbackStats,
  leadership as fallbackLeadership,
  updates as fallbackUpdates,
} from '../data/siteData'
import { cmsEntries } from '../services/cms'

const clone = (value) => JSON.parse(JSON.stringify(value))

const dateValue = (value) => {
  const timestamp = Date.parse(value || '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortCollection = (collection, items) => {
  if (collection === 'updates' || collection === 'environment') return [...items].sort((a, b) => dateValue(b.date) - dateValue(a.date))
  return items
}

export const cmsContent = reactive({
  departments: clone(fallbackDepartments),
  projects: clone(fallbackProjects),
  publications: clone(fallbackPublications),
  stats: clone(fallbackStats),
  leadership: clone(fallbackLeadership),
  updates: sortCollection('updates', clone(fallbackUpdates)),
  environment: sortCollection('environment', clone(fallbackEnvironment)),
  loaded: false,
})

export const cmsFallbacks = {
  departments: fallbackDepartments,
  projects: fallbackProjects,
  publications: fallbackPublications,
  stats: fallbackStats,
  leadership: fallbackLeadership,
  updates: fallbackUpdates,
  environment: fallbackEnvironment,
}

export const loadPublishedContent = async () => {
  try {
    const entries = await cmsEntries.published()
    if (!entries.length) return

    const grouped = entries.reduce((result, entry) => {
      if (!result[entry.collection]) result[entry.collection] = []
      result[entry.collection].push({ ...entry.payload, _cmsId: entry.id, _publishedAt: entry.published_at })
      return result
    }, {})

    Object.entries(grouped).forEach(([collection, items]) => {
      if (collection in cmsContent) cmsContent[collection] = sortCollection(collection, items)
    })
  } catch (error) {
    console.warn('Published CMS content could not be loaded; local content remains active.', error)
  } finally {
    cmsContent.loaded = true
  }
}

export const formatCmsDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-UG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export const createSeedEntries = () => Object.entries(cmsFallbacks).flatMap(([collection, items]) =>
  items.map((payload, index) => ({
    collection,
    slug: payload.slug || null,
    title: payload.title || payload.name || payload.label || payload.office,
    payload: clone(payload),
    status: 'draft',
    sort_order: index,
  })),
)
