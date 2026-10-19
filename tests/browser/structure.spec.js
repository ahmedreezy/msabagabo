import { test, expect } from '@playwright/test'

const useFallbackContent = async (page) => {
  await page.route('https://education-test.supabase.co/**', (route) => route.fulfill({ json: [] }))
}

test('department content follows mandate, sectors and FAQ order', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/finance-planning')
  await expect(page.getByRole('heading', { name: 'Finance & Planning', exact: true })).toBeVisible()
  await expect(page.locator('.department-sectors article')).toHaveCount(4)
  await expect(page.locator('.department-faqs article')).toHaveCount(7)
  const positions = await page.locator('#mandate, #sectors, #department-faqs').evaluateAll((elements) => elements.map((element) => element.offsetTop))
  expect(positions[0]).toBeLessThan(positions[1])
  expect(positions[1]).toBeLessThan(positions[2])
})

test('department directory and navigation contain one entry per department', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments')
  await expect(page.locator('.department-directory-card')).toHaveCount(11)
  const routes = await page.locator('.department-directory-card a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  expect(new Set(routes).size).toBe(routes.length)

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByRole('button', { name: /Departments/ }).click()
  await expect(page.locator('a[href="/departments/internal-audit"]')).toHaveCount(1)
  await expect(page.locator('a[href="/departments/planning-unit"]')).toHaveCount(1)
})

test('Administration and Education display their department-specific WebP backgrounds', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/education-sports')
  await expect(page.locator('.page-hero__illustration')).toHaveAttribute('src', '/images/departments/education-building-v3.webp')
  await expect(page.locator('.page-hero__illustration')).toHaveAttribute('alt', /storeyed classroom building/)

  await page.goto('/departments/administration')
  await expect(page.locator('.page-hero__illustration')).toHaveAttribute('src', '/images/departments/administration-offices.webp')
  await expect(page.locator('.page-hero__illustration')).toHaveAttribute('alt', /administration offices/)
})

test('Works displays Wilber Mukasa as Principal Engineer', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/works-engineering')
  await expect(page.locator('.department-hod__identity')).toContainText('Wilber Mukasa')
  await expect(page.locator('.department-hod__identity')).toContainText('Principal Engineer')
  await expect(page.locator('.department-hod__portrait img')).toHaveAttribute('src', '/images/departments/wilber-mukasa-principal-engineer.webp')
  await expect(page.locator('.department-hod__portrait img')).toHaveAttribute('alt', 'Wilber Mukasa, Principal Engineer')
  await expect(page.getByText('The officer’s verified portrait, name and welcome message can be added through the CMS.')).toHaveCount(0)

  await page.goto('/departments/finance-planning')
  await expect(page.locator('.department-hod')).toHaveCount(0)
  await expect(page.getByText('The officer’s verified portrait, name and welcome message can be added through the CMS.')).toHaveCount(0)
})

test('Education displays Nsangi Pauline as Principal Education Officer', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/education-sports')
  await expect(page.locator('.department-hod__identity')).toContainText('Nsangi Pauline')
  await expect(page.locator('.department-hod__identity')).toContainText('Principal Education Officer')
  await expect(page.locator('.department-hod__portrait img')).toHaveAttribute('src', '/images/departments/nsangi-pauline-principal-education-officer.webp')
  await expect(page.locator('.department-hod__portrait img')).toHaveAttribute('alt', 'Nsangi Pauline, Principal Education Officer')
})

test('Physical Planning and Natural Resources features both technical officers', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/natural-resources')
  await expect(page.locator('.department-leadership__grid article')).toHaveCount(2)
  await expect(page.locator('.department-leadership')).toContainText('Matia Bisirikirwa')
  await expect(page.locator('.department-leadership')).toContainText('Head of Physical Planning Unit')
  await expect(page.locator('.department-leadership')).toContainText('Ssempala Alaphat')
  await expect(page.locator('.department-leadership')).toContainText('Senior Environment Officer')
  await expect(page.locator('.department-team')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('programmes page presents contracts and progress without mobile overflow', async ({ page }) => {
  await useFallbackContent(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/programmes-projects')
  await expect(page.getByRole('heading', { name: 'Greater Kampala Metropolitan Area Urban Development Programme' })).toBeVisible()
  await expect(page.locator('.programme-contracts tbody tr')).toHaveCount(5)
  await expect(page.locator('.programme-progress__list article')).toHaveCount(13)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('homepage uses the municipal aerial and renders CMS-ready achievements', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/')
  await expect(page.locator('.page-hero__illustration')).toHaveAttribute('src', '/images/msmc-aerial-home.jpg')
  await expect(page.getByRole('heading', { name: 'Ongoing activities & achievements' })).toBeVisible()
  await expect(page.locator('.achievement-ledger__list article')).toHaveCount(4)
})

test('FAQ directory includes collected answers and supports search and department filters', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/faqs')
  await expect(page.locator('.page-hero h1')).toHaveText('Straight answers. Useful next steps.')
  await expect(page.locator('.faq-answer')).toHaveCount(31)
  await expect(page.locator('.faq-search__summary')).toContainText('31 answers')

  await page.getByRole('searchbox', { name: 'Search frequently asked questions' }).fill('property rates')
  await expect(page.locator('.faq-answer')).toHaveCount(1)
  await expect(page.locator('.faq-answer')).toContainText('property rates')

  await page.getByRole('button', { name: /Clear FAQ search/ }).click()
  await page.getByRole('button', { name: /Community Services/ }).click()
  await expect(page.locator('.faq-answer')).toHaveCount(4)
  await expect(page.locator('.faq-group')).toContainText('Community-Based Services')
})

test('Community-Based Services publishes the confirmed MDF member directory', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/departments/community-services')
  await expect(page.locator('.department-faqs article')).toHaveCount(4)
  await expect(page.locator('.public-body__members li')).toHaveCount(36)
  await expect(page.locator('.public-body__intro')).toContainText('36 confirmed members')

  await page.getByRole('searchbox', { name: 'Search forum members' }).fill('J.B Walusimbi')
  await expect(page.locator('.public-body__members li')).toHaveCount(1)
  await expect(page.locator('.public-body__members')).toContainText('Eng. J.B Walusimbi')
  await expect(page.locator('.public-body__members')).toContainText('Professional Agencies (Engineers)')
})

test('Municipal and departmental Notice Boards publish the supplied PDF packs', async ({ page }) => {
  await useFallbackContent(page)
  await page.goto('/municipal-notice-board')
  await expect(page.locator('.notice-board__heading')).toContainText('29 downloadable documents')
  await expect(page.locator('.notice-document__download')).toHaveCount(29)
  await expect(page.getByRole('heading', { name: 'e-Government Procurement (e-GP 2.0) Frequently Asked Questions and Answers' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Final Budget FY 2026/2027' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'List of Proposed Road Names Forwarded to PPC for Approval' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bunamwaya Climate Change Vulnerability Assessment' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'GKMA Community and Contractors’ Grievance Redress Committees' })).toBeVisible()

  await page.goto('/departments/natural-resources')
  await expect(page.locator('.department-facts')).toContainText('24')
  await expect(page.locator('.department-notice-list article')).toHaveCount(6)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
