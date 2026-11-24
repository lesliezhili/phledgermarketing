import { test, expect } from './fixtures'

test.describe('POST /api/reviews/reply', () => {
  test('bad review: drafted apology, not auto-published', async ({ request }) => {
    const res = await request.post('/api/reviews/reply', {
      data: { rating: 1, text: 'Staff were rude', business: 'Sir Charles', contact: 'hello@example.com' },
    })
    expect(res.status()).toBe(200)
    const t = await res.json()
    expect(t.severity).toBe('negative')
    expect(t.autoPublish).toBe(false)
    expect(t.draftReply).toContain('hello@example.com')
  })

  test('food-safety review escalates', async ({ request }) => {
    const t = await (await request.post('/api/reviews/reply', {
      data: { rating: 5, text: 'got food poisoning', business: 'X', contact: 'y' },
    })).json()
    expect(t.escalate).toBe(true)
  })

  test('rejects bad input', async ({ request }) => {
    expect((await request.post('/api/reviews/reply', { data: { rating: 9, text: 'x', business: 'X', contact: 'y' } })).status()).toBe(400)
  })
})

test.describe('POST /api/orders/check', () => {
  const menu = [{ name: 'Ube Mascarpone Cream Cake', sizes: [{ label: '8 inch', price: 85 }], leadDays: 2 }]
  const order = { channel: 'facebook', customerName: 'Mia', contact: '0400 000 000', product: 'Ube Mascapone Cream Cake', size: '8 inch', pickupDate: '2026-12-05' }

  test('confirms a Facebook order and builds the kitchen ticket', async ({ request }) => {
    const r = await (await request.post('/api/orders/check', { data: { order, menu, business: 'Sir Charles', today: '2026-12-01' } })).json()
    expect(r.ok).toBe(true)
    expect(r.price).toBe(85)
    expect(r.confirmation).toContain('Sir Charles has your order')
    expect(r.kitchenTicket).toContain('via Facebook')
  })

  test('RedNote orders are confirmed in Chinese and sent by a person', async ({ request }) => {
    const r = await (await request.post('/api/orders/check', { data: { order: { ...order, channel: 'rednote' }, menu, business: 'Sir Charles', today: '2026-12-01' } })).json()
    expect(r.autoReply).toBe(false)
    expect(r.confirmation).toContain('已收到您的订单')
  })

  test('rejects an unknown channel', async ({ request }) => {
    expect((await request.post('/api/orders/check', { data: { order: { ...order, channel: 'fax' }, menu, business: 'X' } })).status()).toBe(400)
  })
})
