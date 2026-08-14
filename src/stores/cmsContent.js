import { reactive } from 'vue'
import {
  departments as fallbackDepartments,
  projects as fallbackProjects,
  publications as fallbackPublications,
  homepageStats as fallbackStats,
  updates as fallbackUpdates,
} from '../data/siteData'
import { cmsEntries } from '../services/cms'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const cmsContent = reactive({
  departments: clone(fallbackDepartments),
  projects: clone(fallbackProjects),
  publications: clone(fallbackPublications),
  stats: clone(fallbackStats),
  updates: clone(fallbackUpdates),
  loaded: false,
})

export const cmsFallbacks = {
  departments: fallbackDepartments,
  projects: fallbackProjects,
  publications: fallbackPublications,
  stats: fallbackStats,
  updates: fallbackUpdates,
}

export const loadPublishedContent = async () => {
  try {
    const entries = await cmsEntries.published()
    if (!entries.length) return

    const grouped = entries.reduce((result, entry) => {
      if (!result[entry.collection]) result[entry.collection] = []
      result[entry.collection].push({ ...entry.payload, _cmsId: entry.id })
      return result
    }, {})

    Object.entries(grouped).forEach(([collection, items]) => {
      if (collection in cmsContent) cmsContent[collection] = items
    })
  } catch (error) {
    console.warn('Published CMS content could not be loaded; local content remains active.', error)
  } finally {
    cmsContent.loaded = true
  }
}

export const createSeedEntries = () => Object.entries(cmsFallbacks).flatMap(([collection, items]) =>
  items.map((payload, index) => ({
    collection,
    slug: payload.slug || null,
    title: payload.title || payload.name || payload.label,
    payload: clone(payload),
    status: 'draft',
    sort_order: index,
  })),
)
