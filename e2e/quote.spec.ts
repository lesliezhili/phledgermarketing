import { test, expect } from './fixtures'

const k = {
  business: 'Sir Charles', contactName: 'K', language: 'zh', channel: 'wechat',
  tier: 'Grace', commitment: 'founding', foundingClientNumber: 1, storeCount: 3,
  products: [{ name: '2. Panda & Coconut Cream Cake' }],
  today: '2026-11-18', meetingDate: '2026-11-21',
}

test.describe('POST /api/quote', () => {
  test('returns numbers, message, checklist, agenda and actions', async ({ request }) => {
    const res = await request.post('/api/quote', { data: k })
    expect(res.status()).toBe(200)
    const q = await res.json()
    expect(q.numbers.dueToday).toBe(1371.9)
    expect(q.message).toContain('首付合计 $1,371.90')
    expect(q.productFixes[0].to).toBe('Pandan & Coconut Cream Cake')
    expect(q.checklist.length).toBeGreaterThan(0)
    expect(q.agenda).toHaveLength(5)
    expect(q.actions.some((a: { action: string }) => a.action.includes('会议'))).toBe(true)
    expect(q.markdown).toContain('## Actions')
  })

  test('refuses the founding offer for a fourth client', async ({ request }) => {
    const res = await request.post('/api/quote', { data: { ...k, foundingClientNumber: 4 } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/first 3 clients/)
  })

  test('rejects invalid input', async ({ request }) => {
    expect((await request.post('/api/quote', { data: { ...k, tier: 'Gold' } })).status()).toBe(400)
    expect((await request.post('/api/quote', { data: { ...k, storeCount: 0 } })).status()).toBe(400)
    expect((await request.post('/api/quote', { data: { ...k, docLink: 'http://x' } })).status()).toBe(400)
    expect((await request.post('/api/quote', { data: { ...k, business: '' } })).status()).toBe(400)
  })
})
