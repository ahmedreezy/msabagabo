import { test, expect } from '@playwright/test'
import { departments } from '../../src/data/siteData.js'
import { emptyEducationProfile } from '../../src/lib/educationProfile.js'

const sourceUrl = 'https://www.msabagabo.go.ug/education'
const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'editor@example.test' }
const baseDepartment = () => structuredClone(departments.find(({ slug }) => slug === 'education-sports'))
const reviewedDepartment = () => ({ ...baseDepartment(), team: [{ name: 'Test education officer', role: 'Education officer' }], educationProfile: {
  ...emptyEducationProfile(), approved: true,
  schools: [
    { id: 'primary', name: 'Test Primary School', level: 'Primary', programme: 'UPE', sourceUrl, reviewed: true },
    { id: 'secondary', name: 'Test Secondary School', level: 'Secondary', programme: 'USE', sourceUrl, reviewed: true },
  ],
} })
const entryFor = (payload, status = 'draft') => ({ id: 'department-entry', collection: 'departments', slug: payload.slug, title: payload.name, payload, status, sort_order: 0, updated_at: '2026-09-07T10:00:00Z', published_at: status === 'published' ? '2026-09-07T10:00:00Z' : null })

async function mockCms(page, initial = []) {
  let entries = structuredClone(initial)
  let writes = 0
  let rejectUpload = false
  await page.route('https://education-test.supabase.co/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.includes('/auth/')) return route.fulfill({ json: user })
    if (url.pathname.endsWith('/profiles')) return route.fulfill({ json: { id: user.id, full_name: 'Test publisher', role: 'publisher' } })
    if (url.pathname.includes('/storage/')) return rejectUpload ? route.fulfill({ status: 500, json: { error: 'Upload failed', message: 'Upload failed' } }) : route.fulfill({ json: { Key: 'test-file', Id: 'test-file' } })
    if (!url.pathname.endsWith('/cms_entries')) return route.fulfill({ status: 404, json: {} })
    if (['POST', 'PATCH'].includes(request.method())) {
      writes++
      const record = { ...request.postDataJSON(), id: 'department-entry', updated_at: '2026-09-07T11:00:00Z' }
      entries = entries.filter(({ id }) => id !== record.id).concat(record)
      return route.fulfill({ json: record })
    }
    const status = url.searchParams.get('status')?.replace('eq.', '')
    const collection = url.searchParams.get('collection')?.replace('eq.', '')
    return route.fulfill({ json: entries.filter((entry) => (!status || entry.status === status) && (!collection || entry.collection === collection)) })
  })
  return { entries: () => entries, writes: () => writes, failUploads: () => { rejectUpload = true } }
}

async function login(page) {
  await page.addInitScript(({ user }) => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem('sb-education-test-auth-token', JSON.stringify({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp, aud: 'authenticated', role: 'authenticated' })}.test`, refresh_token: 'test-refresh-token', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
  }, { user })
}

async function openEditor(page) {
  await login(page)
  await page.goto('/admin')
  await expect(page.locator('.admin-profile')).toContainText('Test publisher')
  await expect(page.locator('.admin-state')).not.toContainText('Loading content')
  await page.locator('.admin-sidebar').getByRole('button', { name: 'Departments', exact: true }).click()
  await page.locator('.admin-row').filter({ hasText: 'Education & Sports' }).click()
  await expect(page.getByRole('region', { name: 'Education page content' })).toBeVisible()
}

test('development directory filters, resets and supports both routes', async ({ page }) => {
  await mockCms(page)
  await page.goto('/directorates/education-sports')
  await expect(page.locator('.education-draft-bar')).toBeVisible()
  await expect(page.locator('.education-schools > li')).toHaveCount(21)
  await page.getByLabel('School name', { exact: true }).fill('  lUBugumu ')
  await page.getByLabel('Level', { exact: true }).selectOption('Secondary')
  await page.getByLabel('Programme', { exact: true }).selectOption('USE')
  await expect(page.locator('.education-schools > li')).toHaveCount(1)
  await expect(page.locator('.education-schools')).toContainText('Lubugumu Jamia')
  await page.getByLabel('Programme', { exact: true }).selectOption('Partnership')
  await expect(page.getByRole('heading', { name: 'No schools match your search' })).toBeVisible()
  await page.locator('.education-empty').getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.locator('.education-schools > li')).toHaveCount(21)
  await page.goto('/departments/education-sports#schools')
  await expect(page.getByRole('heading', { name: 'Find a school', exact: true })).toBeVisible()
  await expect(page.locator('#schools')).toBeFocused()
})

for (const width of [1440, 820, 390, 320]) {
  test(`layout and section navigation at ${width}px`, async ({ page }) => {
    await mockCms(page)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/departments/education-sports')
    await expect(page.locator('.education-schools > li')).toHaveCount(21)
    await expect(page.locator('.page-transition-enter-active')).toHaveCount(0)
    await page.screenshot({ path: `test-results/education-intro-${width}.png` })
    if (width <= 1000) {
      await page.locator('.education-mobile-nav > summary').click()
      await page.locator('.education-mobile-nav').getByRole('link', { name: 'Find a school' }).click()
      await expect(page.locator('.education-mobile-nav')).not.toHaveAttribute('open', '')
    } else {
      await page.locator('.education-desktop-nav').getByRole('link', { name: 'Find a school' }).click()
    }
    await expect(page.locator('#schools')).toBeFocused()
    await expect.poll(async () => page.evaluate(() => document.querySelector('#schools').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom)).toBe(true)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const outline = await page.getByLabel('School name', { exact: true }).evaluate((element) => { element.focus(); return getComputedStyle(element).outlineStyle })
    expect(outline).not.toBe('none')
    await page.screenshot({ path: `test-results/education-${width}.png`, fullPage: true })
  })
}

test('published content hides empty sections, notes and missing photos', async ({ page }) => {
  await mockCms(page, [entryFor(reviewedDepartment(), 'published')])
  await page.goto('/departments/education-sports')
  await expect(page.locator('.education-schools > li')).toHaveCount(2)
  await expect(page.locator('.education-draft-bar')).toHaveCount(0)
  await expect(page.locator('#activities, #documents, #guidance')).toHaveCount(0)
  await expect(page.locator('.education-team')).toContainText('Test education officer')
  await expect(page.locator('.education-team img')).toHaveCount(0)
  await expect(page.locator('.education-desktop-nav')).not.toContainText('Documents')
  await expect(page.locator('.education-help a')).toHaveAttribute('href', '/contact#contact-details')
})

test('existing departments keep their layout and unknown slugs show not found', async ({ page }) => {
  await mockCms(page)
  await page.goto('/directorates/health')
  await expect(page.getByRole('heading', { name: 'Health', exact: true })).toBeVisible()
  await expect(page.locator('.education-page')).toHaveCount(0)
  await page.goto('/directorates/no-such-department')
  await expect(page.getByRole('heading', { name: 'We could not find that page.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Administration', exact: true })).toHaveCount(0)
})

test('CMS draft import, reorder, save, reload, preview and publication blocking', async ({ page }) => {
  const cms = await mockCms(page, [entryFor(baseDepartment())])
  await openEditor(page)
  await page.getByRole('button', { name: 'Load research draft' }).click()
  const schools = page.locator('.education-editor-group').filter({ has: page.locator('summary', { hasText: /^School directory/ }) })
  await schools.locator(':scope > summary').click()
  await schools.locator('.education-editor-entry').first().locator(':scope > summary').click()
  await schools.getByRole('button', { name: 'Move Andrews Kaggwa PS down', exact: true }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect.poll(() => cms.writes()).toBe(1)
  expect(cms.entries()[0].payload.educationProfile.schools[0].name).toBe('Busabala PS')
  expect(cms.entries()[0].payload.services).toEqual(baseDepartment().services)
  await page.reload()
  await page.locator('.admin-sidebar').getByRole('button', { name: 'Departments', exact: true }).click()
  await page.locator('.admin-row').filter({ hasText: 'Education & Sports' }).click()
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click()
  await expect(page.getByRole('dialog').locator('.education-page')).toBeVisible()
  await expect(page.getByRole('dialog').locator('.education-schools > li')).toHaveCount(21)
  await expect(page.getByRole('button', { name: 'Close preview', exact: true })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Back to editing' })).toBeFocused()
  await page.getByRole('button', { name: 'Back to editing' }).click()
  await page.getByLabel('Publishing state').selectOption('published')
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
  await expect(page.locator('.admin-feedback')).toContainText('Review and approve')
  expect(cms.writes()).toBe(1)
})

test('CMS publishes reviewed records without portraits and edits require fresh approval', async ({ page }) => {
  const cms = await mockCms(page, [entryFor(reviewedDepartment())])
  await openEditor(page)
  await expect(page.locator('.education-editor-ready')).toBeVisible()
  await page.getByLabel('Publishing state').selectOption('published')
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
  await expect.poll(() => cms.entries()[0].status).toBe('published')
  await page.locator('#cms-field-summary').fill('Updated education introduction')
  await expect(page.getByLabel('I have checked the department’s introduction', { exact: false })).not.toBeChecked()
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
  await expect(page.locator('.admin-feedback')).toContainText('Review and approve')
  expect(cms.writes()).toBe(1)
})

test('production excludes local drafts and unresolved published profiles', async ({ page }) => {
  await mockCms(page)
  await page.goto('http://127.0.0.1:4174/departments/education-sports')
  await expect(page.locator('.education-page h1')).toHaveText('Education & Sports')
  await expect(page.locator('.education-draft-bar, .education-review-note, .education-schools')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('Andrews Kaggwa PS')
  const invalid = reviewedDepartment()
  invalid.educationProfile.schools[0].reviewNote = 'INTERNAL NOTE MUST STAY PRIVATE'
  await mockCms(page, [entryFor(invalid, 'published')])
  await page.reload()
  await expect(page.locator('.education-schools')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('INTERNAL NOTE MUST STAY PRIVATE')
})

test('production shows reviewed guidance, documents and image fallbacks', async ({ page }) => {
  const department = reviewedDepartment()
  department.team[0].photo = '/missing-portrait.png'
  department.educationProfile.guidance = [{ id: 'enquiry', title: 'School enquiries', audience: 'Parents and guardians.', steps: ['Contact the school.', 'Contact the council for further guidance.'], responsible: 'Education office', sourceUrl, reviewed: true }]
  department.educationProfile.activities = [{ id: 'activity', title: 'Test school works update', date: '2026-09-01', description: 'A dated test update.', image: '/missing-activity.png', caption: 'School works', sourceUrl, reviewed: true }]
  department.educationProfile.documents = [{ id: 'document', title: 'Education guidance', url: sourceUrl, format: 'Web page', sourceUrl, reviewed: true }]
  await mockCms(page, [entryFor(department, 'published')])
  await page.route('**/missing-*.png', (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto('http://127.0.0.1:4174/departments/education-sports#schools')
  await expect(page.locator('.education-schools > li')).toHaveCount(2)
  await expect(page.locator('.education-service ol > li')).toHaveCount(2)
  await expect(page.locator('.education-draft-bar')).toHaveCount(0)
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.locator('.education-team img')).toHaveCount(0)
  await page.locator('#activities').scrollIntoViewIfNeeded()
  await expect(page.locator('.education-activities img')).toHaveCount(0)
  await expect(page.locator('.education-activities')).toContainText('Test school works update')
  await expect(page.locator('.education-documents a')).toHaveAttribute('href', sourceUrl)
})

test('CMS creates and edits entries, removes them, and preserves files when uploads fail', async ({ page }) => {
  const cms = await mockCms(page, [entryFor(reviewedDepartment())])
  await openEditor(page)
  const documents = page.locator('.education-editor-group').filter({ has: page.locator('summary', { hasText: /^Documents and guidance/ }) })
  await documents.locator(':scope > summary').click()
  await documents.getByRole('button', { name: '+ Add document', exact: true }).click()
  const document = documents.locator('.education-editor-entry').last()
  await document.getByLabel('Document title').fill('Test guidance')
  await document.getByLabel('Document or guidance URL').fill('https://www.msabagabo.go.ug/education')
  await document.getByLabel('Format', { exact: false }).selectOption('PDF')
  await document.getByLabel('Source reference').fill(sourceUrl)
  const fileInput = document.locator('input[type=file]')
  await fileInput.setInputFiles({ name: 'guidance.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test file') })
  await expect(document.getByLabel('Document or guidance URL')).toHaveValue(/storage\/v1\/object\/public\/cms-media/)
  const uploadedUrl = await document.getByLabel('Document or guidance URL').inputValue()
  cms.failUploads()
  await fileInput.setInputFiles({ name: 'replacement.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 replacement') })
  await expect(page.locator('.education-editor-error')).toContainText('Upload failed')
  await expect(document.getByLabel('Document or guidance URL')).toHaveValue(uploadedUrl)
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect.poll(() => cms.writes()).toBe(1)
  expect(cms.entries()[0].payload.educationProfile.documents[0].url).toBe(uploadedUrl)
  await documents.locator(':scope > summary').click()
  await documents.locator('.education-editor-entry > summary').click()
  await documents.getByRole('button', { name: 'Remove Test guidance' }).click()
  await expect(documents.locator('.education-editor-entry')).toHaveCount(0)
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect.poll(() => cms.writes()).toBe(2)
  expect(cms.entries()[0].payload.educationProfile.documents).toEqual([])
})
