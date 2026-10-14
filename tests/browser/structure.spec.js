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
  await expect(page.locator('.faq-answer')).toHaveCount(29)
  await expect(page.locator('.faq-search__summary')).toContainText('29 answers')

  await page.getByRole('searchbox', { name: 'Search frequently asked questions' }).fill('property rates')
  await expect(page.locator('.faq-answer')).toHaveCount(1)
  await expect(page.locator('.faq-answer')).toContainText('property rates')

  await page.getByRole('button', { name: /Clear FAQ search/ }).click()
  await page.getByRole('button', { name: /Community Services/ }).click()
  await expect(page.locator('.faq-answer')).toHaveCount(2)
  await expect(page.locator('.faq-group')).toContainText('Community-Based Services')
})
