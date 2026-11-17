import { test as base, expect, type Page } from '@playwright/test'

// Fails any test whose page logs a console error or throws.
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
    await use(errors)
    expect(errors, 'browser errors').toEqual([])
  },
})

export { expect }

/** The booking sidebar's order summary as one line of text. */
export async function orderSummary(page: Page) {
  const text = await page.locator('xpath=//h3[contains(., "Order Summary")]/..').innerText()
  return text.replace(/\s+/g, ' ')
}
