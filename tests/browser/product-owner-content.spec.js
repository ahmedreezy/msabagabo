import { test, expect } from '@playwright/test'
import { departments, officialFaqs, projects } from '../../src/data/siteData.js'

const entry = (collection, payload, index) => ({
  id: `${collection}-${index}`,
  collection,
  slug: payload.slug,
  title: payload.title || payload.name || payload.question,
  payload,
  status: 'published',
  sort_order: index,
  published_at: '2026-10-01T00:00:00Z',
})
const publishedEntries = [
  ...departments.map((payload, index) => entry('departments', payload, index)),
  ...officialFaqs.map((payload, index) => entry('faqs', payload, index)),
  ...projects.map((payload, index) => entry('projects', payload, index)),
  {
    id: 'existing-project',
    collection: 'projects',
    slug: 'existing-cms-project',
    title: 'Existing CMS project',
    payload: { title: 'Existing CMS project', sector: 'Infrastructure', status: 'Published' },
    status: 'published',
    sort_order: 0,
    published_at: '2026-10-01T00:00:00Z',
  },
]

test.beforeEach(async ({ page }) => {
  await page.route('https://education-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/rest/v1/cms_entries')) return route.fulfill({ json: publishedEntries })
    return route.fulfill({ status: 404, json: {} })
  })
})

test('owner department content and FAQs remain visible alongside existing CMS records', async ({ page }) => {
  await page.goto('/directorates/finance-planning')
  await expect(page.getByRole('heading', { name: 'Finance & Planning', exact: true })).toBeVisible()
  await expect(page.getByText('To mobilise revenue and to plan, budget and coordinate', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible()
  const taxes = page.getByText('Which local taxes and fees may a resident or business need to pay?', { exact: true })
  await taxes.click()
  await expect(page.getByText('Bunamwaya, Masajja or Ndejje Division', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('0782 395 800', { exact: false })).toBeVisible()
  await expect(page.locator('section[aria-labelledby="directorate-faqs-heading"] details')).toHaveCount(7)

  await page.goto('/directorates/community-services')
  await expect(page.locator('section[aria-labelledby="directorate-faqs-heading"] details')).toHaveCount(2)

  await page.goto('/faqs')
  await expect(page.locator('main details')).toHaveCount(9)
  await expect(page.getByText('Which local taxes and fees may a resident or business need to pay?', { exact: true })).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'View directorate' })).toHaveCount(2)
})

test('complete GKMA programme remains visible alongside existing CMS projects', async ({ page }) => {
  await page.goto('/projects/greater-kampala-metropolitan-area-urban-development-programme')
  await expect(page.getByRole('heading', { name: 'Greater Kampala Metropolitan Area Urban Development Programme' })).toBeVisible()
  await expect(page.getByText('Economic Development Strategy 2020–2030', { exact: false })).toBeVisible()
  await expect(page.getByText('UGX 37,857,827,188', { exact: true })).toBeVisible()
  await expect(page.getByText('Mock assessment monitoring', { exact: true })).toBeVisible()
  await expect(page.getByText('Makindye Website Information 2026', { exact: false })).toBeVisible()
})
