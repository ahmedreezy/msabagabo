import { expect, test } from '@playwright/test'

async function mockPublicServices(page) {
  await page.route('https://education-test.supabase.co/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.endsWith('/functions/v1/mr-ssabagabo')) {
      const body = request.postDataJSON()
      return route.fulfill({
        json: {
          answer: `The Education & Sports Directorate can guide you about ${body.message} [1]. Confirm the current requirements before travelling.`,
          grounded: true,
          sources: [{ title: 'Education and school enquiries', url: '/directorates/education-sports', lastReviewed: '2026-09-22' }],
        },
      })
    }
    if (url.pathname.endsWith('/rest/v1/cms_entries')) return route.fulfill({ json: [] })
    return route.fulfill({ status: 404, json: {} })
  })
}

test('Mr. Ssabagabo opens, answers from a source and closes with the keyboard', async ({ page }) => {
  await mockPublicServices(page)
  await page.goto('/')

  const trigger = page.getByRole('button', { name: /Ask Mr\. Ssabagabo/ })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Mr. Ssabagabo' })
  await expect(dialog).toBeVisible()
  await expect(page.getByLabel('Ask about a municipal service')).toBeFocused()
  await expect(dialog).toContainText('Do not share passwords')

  await page.getByRole('button', { name: 'Where do I ask about registering a school?' }).click()
  await expect(dialog).toContainText('Education & Sports Directorate')
  await expect(dialog.getByRole('link', { name: 'Education and school enquiries' })).toHaveAttribute('href', '/directorates/education-sports')
  await page.screenshot({ path: 'test-results/mr-ssabagabo-desktop.png' })

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Mr. Ssabagabo fits a small mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await mockPublicServices(page)
  await page.goto('/services')
  await page.getByRole('button', { name: /Ask Mr\. Ssabagabo/ }).click()
  await expect(page.getByRole('dialog', { name: 'Mr. Ssabagabo' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/mr-ssabagabo-mobile.png' })
})
