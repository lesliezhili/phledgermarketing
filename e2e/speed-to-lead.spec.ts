import { test, expect } from './fixtures'

test('demo shows the instant reply a customer receives', async ({ page, errors }) => {
  await page.goto('/speed-to-lead')
  await page.getByLabel('Business name').fill('Fitzroy Mowing')
  await page.getByLabel('Your trade').selectOption('mowing')
  await page.getByRole('button', { name: 'Preview the reply' }).click()
  const reply = page.getByTestId('reply')
  await expect(reply).toContainText('sorry we missed your call to Fitzroy Mowing')
  await expect(reply).toContainText('Front, back or both yards')
  await expect(reply).toContainText('automated assistant')
  await expect(reply).toContainText('Reply STOP to opt out')
  void errors
})

test('services page links to the demo', async ({ page, errors }) => {
  await page.goto('/services')
  await page.getByRole('link', { name: 'Try the Speed-to-Lead Demo' }).click()
  await expect(page).toHaveURL(/\/speed-to-lead$/)
  void errors
})

test.describe('POST /api/leads/reply', () => {
  test('tracked lead: chargeable, with reply', async ({ request }) => {
    const res = await request.post('/api/leads/reply', {
      data: { business: 'Sparkle Clean', trade: 'cleaning', channel: 'sms', source: 'tracked_form' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.chargeable).toBe(true)
    expect(body.reply).toContain('How many bedrooms and bathrooms?')
  })

  test('hipages lead: replied to but never charged per lead', async ({ request }) => {
    const res = await request.post('/api/leads/reply', {
      data: { business: 'Tall Trees', trade: 'tree', channel: 'email', source: 'hipages' },
    })
    const body = await res.json()
    expect(body.chargeable).toBe(false)
    expect(body.reason).toMatch(/platform lead/)
    expect(body.reply).not.toContain('Reply STOP') // email, not SMS
  })

  test('rejects bad input', async ({ request }) => {
    expect((await request.post('/api/leads/reply', { data: { channel: 'sms' } })).status()).toBe(400)
    expect((await request.post('/api/leads/reply', { data: { business: 'X', channel: 'fax' } })).status()).toBe(400)
    expect((await request.post('/api/leads/reply', { data: { business: 'X', channel: 'sms', source: 'nope' } })).status()).toBe(400)
    expect((await request.post('/api/leads/reply', { data: 'not json', headers: { 'content-type': 'application/json' } })).status()).toBe(400)
  })

  test('ignores a non-https booking link', async ({ request }) => {
    const res = await request.post('/api/leads/reply', {
      data: { business: 'X', channel: 'sms', bookingLink: 'javascript:alert(1)' },
    })
    expect((await res.json()).reply).not.toContain('javascript:')
  })
})

test('POST /api/pricing/quote still works', async ({ request }) => {
  const res = await request.post('/api/pricing/quote', { data: { category: 'personalCare', hours: 2, startHour: 8 } })
  expect(res.status()).toBe(200)
  expect((await res.json()).quote.customerTotal).toBeGreaterThan(0)
})
