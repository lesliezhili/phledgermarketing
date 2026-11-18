import { test, expect } from './fixtures'

const routes = [
  '/', '/services', '/pricing', '/booking', '/speed-to-lead', '/signup', '/login', '/about',
  '/linkedin', '/instagram', '/facebook', '/x-twitter', '/google-maps', '/bible', '/feedback',
  '/phledgertax', '/finance', '/geo', '/consulting',
]

for (const route of routes) {
  test(`${route} loads without errors`, async ({ page, errors }) => {
    const res = await page.goto(route)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
    void errors
  })
}

test('home page sells to any business, not one platform', async ({ page, errors }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Marketing for Any Business')
  await expect(page.getByText('Whatever You Sell, One Proven Method')).toBeVisible()
  for (const type of ['Local shop or venue', 'Online product', 'Service to businesses', 'Service to people', 'Church or non-profit']) {
    await expect(page.getByRole('heading', { name: type })).toBeVisible()
  }
  await expect(page.getByText('Tiny business (turnover under $2 million)? Pay only per lead.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Why Businesses Choose PhLedger Marketing' })).toBeVisible()
  // no unverified statistics on the home page
  for (const claim of ['5,000+', '25,000+', '420%', '98%']) await expect(page.getByText(claim, { exact: true })).toHaveCount(0)
  void errors
})

test('channels menu lists every channel', async ({ page, errors }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Channels' }).click()
  for (const name of ['Google Maps & Search', 'Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)']) {
    await expect(page.getByRole('link', { name: new RegExp(name.replace(/[()&]/g, '.')) }).first()).toBeVisible()
  }
  void errors
})

test('consulting page links to phledger.com with referral tracking', async ({ page, errors }) => {
  await page.goto('/consulting')
  const link = page.getByRole('link', { name: 'Visit phledger.com' })
  const href = await link.getAttribute('href')
  expect(href).toContain('https://phledger.com/')
  expect(href).toContain('utm_source=phledger-marketing')
  expect(href).toContain('utm_medium=referral')
  for (const step of ['Decision sprint', 'Embedded FDE', 'Fixed-scope build']) {
    await expect(page.getByRole('heading', { name: new RegExp(step) })).toBeVisible()
  }
  await expect(page.getByText('A$18,000 fixed, 2 weeks')).toBeVisible()
  await page.goto('/services')
  await page.getByRole('link', { name: 'Data, BI & AI Consulting' }).click()
  await expect(page).toHaveURL(/\/consulting$/)
  void errors
})
