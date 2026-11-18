import { test, expect } from './fixtures'

const PHL = { origin: 'https://phledger.com' }

test('chat API answers phledger.com visitors from approved facts', async ({ request }) => {
  const res = await request.post('/api/chat', { headers: PHL, data: { client: 'phledger', messages: [{ role: 'user', content: 'How much is embedded FDE?' }] } })
  expect(res.status()).toBe(200)
  expect(res.headers()['access-control-allow-origin']).toBe('https://phledger.com')
  const b = await res.json()
  expect(b.reply).toContain('A$26,000 per engineer per month')
  expect(b.stage).toBe('presale')
  expect(b).not.toHaveProperty('internalNote')
})

test('chat API: complaints need a person; bad requests and other sites refused', async ({ request }) => {
  const c = await request.post('/api/chat', { headers: PHL, data: { client: 'phledger', messages: [{ role: 'user', content: 'I am not happy with the work and want a refund' }] } })
  expect((await c.json()).needsPerson).toBe(true)

  expect((await request.post('/api/chat', { headers: PHL, data: { client: 'nobody', messages: [{ role: 'user', content: 'hi' }] } })).status()).toBe(400)
  expect((await request.post('/api/chat', { headers: PHL, data: { client: 'phledger', messages: [] } })).status()).toBe(400)
  expect((await request.post('/api/chat', { headers: { origin: 'https://evil.example' }, data: { client: 'phledger', messages: [{ role: 'user', content: 'hi' }] } })).status()).toBe(403)
})

test('chat hand-over is never lost (email fallback without a database)', async ({ request }) => {
  const res = await request.post('/api/chat/handover', {
    headers: PHL,
    data: { client: 'phledger', name: 'Test', contact: 'test@example.com', consent: true, messages: [{ role: 'user', content: 'Please call me about a migration' }] },
  })
  if (res.status() === 201) expect((await res.json()).stored).toBe(true)
  else {
    const b = await res.json()
    expect(b.stored).toBe(false)
    expect(decodeURIComponent(b.fallback)).toContain('Visitor: Please call me about a migration')
  }
})
