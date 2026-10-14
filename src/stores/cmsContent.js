import { reactive } from 'vue'
import {
  departments as fallbackDepartments,
  projects as fallbackProjects,
  publications as fallbackPublications,
  environmentBulletins as fallbackEnvironment,
  homepageAchievements as fallbackAchievements,
  homepageStats as fallbackStats,
  leadership as fallbackLeadership,
  officialFaqs as fallbackFaqs,
  pagePresentations as fallbackPagePresentations,
  updates as fallbackUpdates,
} from '../data/siteData'
import { cmsEntries } from '../services/cms'
import { isSupabaseConfigured } from '../lib/supabase'

const clone = (value) => JSON.parse(JSON.stringify(value))

const dateValue = (value) => {
  const timestamp = Date.parse(value || '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortCollection = (collection, items) => {
  if (collection === 'updates' || collection === 'environment') return [...items].sort((a, b) => dateValue(b.date) - dateValue(a.date))
  return items
}

const initialItems = (items) => isSupabaseConfigured && !import.meta.env.DEV ? [] : clone(items)

export const cmsContent = reactive({
  departments: clone(fallbackDepartments),
  achievements: clone(fallbackAchievements),
  projects: clone(fallbackProjects),
  publications: clone(fallbackPublications),
  stats: clone(fallbackStats),
  leadership: clone(fallbackLeadership),
  page_presentations: clone(fallbackPagePresentations),
  updates: sortCollection('updates', clone(fallbackUpdates)),
  environment: sortCollection('environment', clone(fallbackEnvironment)),
  loaded: false,
})

export const cmsFallbacks = {
  departments: fallbackDepartments,
  achievements: fallbackAchievements,
  projects: fallbackProjects,
  publications: fallbackPublications,
  stats: fallbackStats,
  leadership: fallbackLeadership,
  page_presentations: fallbackPagePresentations,
  updates: fallbackUpdates,
  environment: fallbackEnvironment,
  faqs: fallbackFaqs,
}

const hasDepartmentBaseline = (entries) => entries.some((entry) => entry.collection === 'departments')
const restoreFallbackSnapshot = () => {
  Object.entries(cmsFallbacks).forEach(([collection, items]) => {
    cmsContent[collection] = sortCollection(collection, clone(items))
  })
}

export const loadPublishedContent = async () => {
  try {
    const entries = await cmsEntries.published()
    // A connected project may contain only early CMS collections while its full
    // website release is still being reviewed. Use one complete approved snapshot
    // until a directorate baseline exists; never mix partial CMS and fallback rows.
    if (!hasDepartmentBaseline(entries)) {
      restoreFallbackSnapshot()
      return
    }
    const grouped = entries.reduce((result, entry) => {
      if (!result[entry.collection]) result[entry.collection] = []
      result[entry.collection].push({ ...entry.payload, _cmsId: entry.id, _publishedAt: entry.published_at })
      return result
    }, {})

    Object.keys(cmsFallbacks).forEach((collection) => {
      cmsContent[collection] = sortCollection(collection, grouped[collection] || [])
    })
  } catch (error) {
    restoreFallbackSnapshot()
    console.warn('Published CMS content could not be loaded; the approved bundled snapshot is active.', error)
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

export const getPagePresentation = (pageKey, fallbackKey = 'utility-default') => {
  const entries = cmsContent.page_presentations || []
  return entries.find((entry) => entry.slug === pageKey)
    || fallbackPagePresentations.find((entry) => entry.slug === pageKey)
    || entries.find((entry) => entry.slug === fallbackKey)
    || fallbackPagePresentations.find((entry) => entry.slug === fallbackKey)
    || fallbackPagePresentations[0]
}

export const createSeedEntries = () => Object.entries(cmsFallbacks).flatMap(([collection, items]) =>
  items.map((sourcePayload, index) => {
    const payload = clone(sourcePayload)
    if (payload.contentRelease === 'product-owner-2026') payload.reviewStatus = 'needs-review'
    return {
      collection,
      slug: payload.slug || null,
      title: payload.title || payload.name || payload.label || payload.office,
      payload,
      status: 'draft',
      sort_order: index,
    }
  }),
)
