import { test, expect } from '@playwright/test'
import { departments } from '../../src/data/siteData.js'

const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'editor@example.test' }
const baseDepartment = (slug = 'education-sports') => structuredClone(departments.find((department) => department.slug === slug))
const entryFor = (payload, status = 'draft') => ({ id: 'department-entry', collection: 'departments', slug: payload.slug, title: payload.name, payload, status, sort_order: 0, updated_at: '2026-09-07T10:00:00Z', published_at: status === 'published' ? '2026-09-07T10:00:00Z' : null })

async function mockCms(page, initial = []) {
  let entries = structuredClone(initial)
  let writes = 0
  await page.route('https://education-test.supabase.co/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.includes('/auth/')) return route.fulfill({ json: user })
    if (url.pathname.endsWith('/profiles')) return route.fulfill({ json: { id: user.id, full_name: 'Test publisher', role: 'publisher' } })
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
  return { entries: () => entries, writes: () => writes }
}

async function login(page) {
  await page.addInitScript(({ user }) => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem('sb-education-test-auth-token', JSON.stringify({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp, aud: 'authenticated', role: 'authenticated' })}.test`, refresh_token: 'test-refresh-token', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
  }, { user })
}

async function openEditor(page, departmentName = 'Education & Sports') {
  await login(page)
  await page.goto('/admin')
  await expect(page.locator('.admin-profile')).toContainText('Test publisher')
  await expect(page.locator('.admin-state')).not.toContainText('Loading content')
  await page.locator('.admin-sidebar').getByRole('button', { name: 'Departments', exact: true }).click()
  await page.locator('.admin-row').filter({ hasText: departmentName }).click()
  await expect(page.locator('.structured-editor')).toBeVisible()
}

test('Education uses the shared department page on both routes', async ({ page }) => {
  await mockCms(page)
  for (const route of ['/directorates/education-sports', '/departments/education-sports']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { name: 'Education & Sports', exact: true })).toBeVisible()
    await expect(page.locator('.department-page')).toBeVisible()
    await expect(page.locator('.education-page')).toHaveCount(0)
    await expect(page.locator('.department-sectors article')).toHaveCount(3)
    const positions = await page.locator('#mandate, #sectors, #department-faqs').evaluateAll((elements) => elements.map((element) => element.offsetTop))
    expect(positions[0]).toBeLessThan(positions[1])
    expect(positions[1]).toBeLessThan(positions[2])
  }
})

for (const width of [1440, 820, 390, 320]) {
  test(`Education shared layout has no overflow at ${width}px`, async ({ page }) => {
    await mockCms(page)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/departments/education-sports#sectors')
    await expect(page.locator('#sectors')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('Education uses the shared CMS structure editor, preview and publishing flow', async ({ page }) => {
  const cms = await mockCms(page, [entryFor(baseDepartment())])
  await openEditor(page)
  await expect(page.locator('.education-editor')).toHaveCount(0)
  await expect(page.locator('.structured-editor__group').first().locator('.structured-editor__entry')).toHaveCount(3)

  await page.getByRole('button', { name: 'Add question', exact: true }).click()
  const question = page.locator('.structured-editor__group').nth(1).locator('.structured-editor__entry').last()
  await question.getByRole('textbox', { name: /^Question/ }).fill('How do I contact the Education Department?')
  await question.getByRole('textbox', { name: /^Approved answer/ }).fill('Use the official department contact shown on this page.')

  await page.getByRole('button', { name: 'Preview changes', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.cms-preview-department')).toBeVisible()
  await expect(dialog.locator('.education-page')).toHaveCount(0)
  await expect(dialog).toContainText('Sports · Inspection · Administration')
  await expect(dialog).toContainText('1 approved question')
  await page.getByRole('button', { name: 'Back to editing' }).click()

  await page.getByLabel('Publishing state').selectOption('published')
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
  await expect.poll(() => cms.writes()).toBe(1)
  expect(cms.entries()[0].status).toBe('published')
  expect(cms.entries()[0].payload.faqs[0].question).toBe('How do I contact the Education Department?')
})

test('Community-Based Services CMS edits and preserves the confirmed MDF directory', async ({ page }) => {
  const community = baseDepartment('community-services')
  const cms = await mockCms(page, [entryFor(community)])
  await openEditor(page, 'Community-Based Services')
  await expect(page.locator('.public-body-editor')).toBeVisible()
  await expect(page.locator('.public-body-editor__member')).toHaveCount(36)
  const memberRows = page.locator('.public-body-editor__member')
  await expect(memberRows.first().getByRole('textbox', { name: /^Member name/ })).toHaveValue('Mr. Seruwagi Patrick')
  await expect(memberRows.last().getByRole('textbox', { name: /^Member name/ })).toHaveValue('Mr. Sebalamu John')

  await page.getByRole('button', { name: 'Preview changes', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('MSMC Metropolitan Development Forum · 36 members')
  await page.getByRole('button', { name: 'Back to editing' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect.poll(() => cms.writes()).toBe(1)
  expect(cms.entries()[0].payload.publicBodies[0].members).toHaveLength(36)
})

test('unknown department slugs still show not found', async ({ page }) => {
  await mockCms(page)
  await page.goto('/departments/no-such-department')
  await expect(page.getByRole('heading', { name: 'We could not find that page.' })).toBeVisible()
})
