import { test, expect } from './fixtures'

test('customer service demo: presale answer on the website, complaint handed to a person', async ({ page, errors }) => {
  await page.goto('/customer-service')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Get customers before the sale. Keep them after it.')

  await page.getByRole('button', { name: 'How much is the cheesecake?' }).click()
  const result = page.getByTestId('cs-result')
  await expect(result).toContainText('Presale: get customers')
  await expect(result).toContainText('$68 (8 inch)')
  await expect(result).toContainText('Answered by AI')

  await page.getByRole('button', { name: 'Very disappointed, my order was wrong' }).click()
  await expect(result).toContainText('Aftersales: keep customers')
  await expect(result).toContainText('Handed to a person')
  void errors
})

test('customer service demo: phone call speaks, then texts the link', async ({ page, errors }) => {
  await page.goto('/customer-service')
  await page.getByLabel('Channel').selectOption('phone')
  await page.getByLabel('Customer message').fill('I want to order 2 lattes')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  const result = page.getByTestId('cs-result')
  await expect(result).toContainText("speaking with Demo Café's automated assistant")
  await expect(result).toContainText('Texted after the call: Demo Café: https://example.com/order')
  void errors
})

test('services and booking show AI Customer Service as an add-on', async ({ page, errors }) => {
  await page.goto('/services')
  await page.getByRole('link', { name: 'Try AI Customer Service' }).click()
  await expect(page).toHaveURL(/\/customer-service$/)
  await page.goto('/booking?service=12')
  await expect(page.getByText('Add-on to any package or pay per lead · first month')).toBeVisible()
  void errors
})
