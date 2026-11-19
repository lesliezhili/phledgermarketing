import { test, expect } from './fixtures'

test('AI Front Desk page: prices, calculator, Chinese', async ({ page, errors }) => {
  await page.goto('/front-desk')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Never lose an order to a missed call')
  await expect(page.getByText('$8', { exact: false }).first()).toBeVisible()
  await expect(page.getByTestId('fd-estimate')).toContainText('17')
  await page.getByRole('button', { name: '中文' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('漏接电话不再丢单')
  void errors
})

test('integration API: offer, estimate and CORS for phledger.com', async ({ request }) => {
  const offer = await request.get('/api/front-desk/offer?lang=zh', { headers: { origin: 'https://phledger.com' } })
  expect(offer.status()).toBe(200)
  expect(offer.headers()['access-control-allow-origin']).toBe('https://phledger.com')
  const body = await offer.json()
  expect(body.tiers.map((t: { price: number }) => t.price)).toEqual([8, 20])
  expect(body.product).toBe('AI 前台')

  const other = await request.get('/api/front-desk/offer', { headers: { origin: 'https://evil.example' } })
  expect(other.headers()['access-control-allow-origin']).toBeUndefined()

  const est = await request.post('/api/front-desk/estimate', { data: { missedPerWeek: 10, conversionPct: 40, avgOrderValue: 60, tier: 'standard' } })
  expect(await est.json()).toEqual({ ordersPerMonth: 17, revenuePerMonth: 1020, feePerMonth: 136, returnPerDollar: 7.5 })
  const bad = await request.post('/api/front-desk/estimate', { data: { missedPerWeek: -1, conversionPct: 40, avgOrderValue: 60, tier: 'standard' } })
  expect(bad.status()).toBe(400)
})

test('integration API: pilot application never lost (email fallback without a database)', async ({ request }) => {
  const noConsent = await request.post('/api/front-desk/apply', { data: { business: 'Test Café', contact: 'a@b.co' } })
  expect(noConsent.status()).toBe(400)
  const res = await request.post('/api/front-desk/apply', { data: { business: 'Test Café', contact: 'a@b.co', consent: true, source: 'phledger.com/frontdesk' } })
  if (res.status() === 201) {
    expect((await res.json()).stored).toBe(true)
  } else {
    const b = await res.json()
    expect(b.stored).toBe(false)
    expect(b.fallback).toMatch(/^mailto:/)
    expect(decodeURIComponent(b.fallback)).toContain('source: phledger.com/frontdesk')
  }
})

test('preflight from phledger.com is allowed', async ({ request }) => {
  const res = await request.fetch('/api/front-desk/apply', { method: 'OPTIONS', headers: { origin: 'https://phledger.com', 'access-control-request-method': 'POST' } })
  expect(res.status()).toBe(204)
  expect(res.headers()['access-control-allow-methods']).toContain('POST')
})
