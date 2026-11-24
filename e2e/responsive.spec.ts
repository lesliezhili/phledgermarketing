import { test, expect } from './fixtures'

// Runs in the "mobile" project (Pixel 7) only.
for (const route of ['/', '/services', '/pricing', '/booking?service=100', '/speed-to-lead', '/signup']) {
  test(`${route} has no sideways scroll on a phone`, async ({ page, errors }) => {
    await page.goto(route)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    void errors
  })
}

test('mobile menu lists channels and pages', async ({ page, errors }) => {
  await page.goto('/')
  await page.locator('button.lg\\:hidden, .lg\\:hidden > button').first().click()
  await expect(page.getByRole('link', { name: /Pricing/ }).last()).toBeVisible()
  await expect(page.getByRole('link', { name: /LinkedIn/ }).last()).toBeVisible()
  void errors
})
