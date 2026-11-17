import { test, expect, orderSummary } from './fixtures'

test('pricing shows proposal prices, commitments and loyalty rewards', async ({ page, errors }) => {
  await page.goto('/pricing')
  for (const [tier, price] of [['Grace', '$149'], ['Faithful', '$349'], ['Abundant', '$799']]) {
    await expect(page.getByRole('heading', { name: tier, exact: true })).toBeVisible()
    await expect(page.getByText(price, { exact: true }).first()).toBeVisible()
  }
  await expect(page.getByText('One-off setup fee $490', { exact: false })).toBeVisible()
  const twelve = page.getByRole('row', { name: /12 months up front/ })
  await expect(twelve).toContainText('$134/mo')
  await expect(twelve).toContainText('$314/mo')
  await expect(twelve).toContainText('$719/mo')
  await expect(page.getByRole('heading', { name: 'Loyalty Rewards' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Price lock' })).toBeVisible()
  void errors
})

test('booking a Faithful service: monthly, 6 and 12 months up front', async ({ page, errors }) => {
  await page.goto('/booking?service=6')
  await expect(page.locator('form select').first()).toHaveValue('Paid Ads Management')

  // Monthly: $349 + $490 setup
  await expect.poll(() => orderSummary(page)).toContain('Total $839.00')

  await page.getByText('6 months up front').click()
  const six = await orderSummary(page)
  expect(six).toContain('Waived')
  expect(six).toContain('Total $2094.00')

  await page.getByText('12 months up front').click()
  const twelve = await orderSummary(page)
  expect(twelve).toContain('$314.10/mo × 12 (10% off)')
  expect(twelve).toContain('Total $3769.20')
  void errors
})

test('free health check costs nothing and asks no commitment', async ({ page, errors }) => {
  await page.goto('/booking?service=1')
  await expect(page.locator('form select').first()).toHaveValue('Marketing Health Check')
  await expect(page.getByText('How would you like to pay?')).toHaveCount(0)
  await expect.poll(() => orderSummary(page)).toContain('Total Free')
  void errors
})

test('choosing a business type pre-selects its usual channels', async ({ page, errors }) => {
  await page.goto('/booking?service=4')
  await page.getByText('Local shop or venue').click()
  await expect(page.locator('input[type=checkbox].sr-only:checked')).toHaveCount(3)
  void errors
})

test('ad budget is added at cost to the booking total', async ({ page, errors }) => {
  await page.goto('/booking?service=6')
  await page.getByLabel('Paid Ads').selectOption('meta')
  await page.getByLabel('Monthly Ad Budget ($)').fill('425') // any whole-dollar amount is accepted
  await expect.poll(() => orderSummary(page)).toContain('Total $1264.00')
  // the browser must accept the amount (no step mismatch blocking submit)
  expect(await page.getByLabel('Monthly Ad Budget ($)').evaluate(i => (i as HTMLInputElement).validity.valid)).toBe(true)
  void errors
})

test('signup pre-selects the plan chosen on the pricing page', async ({ page, errors }) => {
  await page.goto('/pricing')
  await page.getByRole('link', { name: 'Choose Abundant' }).click()
  await expect(page).toHaveURL(/\/signup\?plan=abundant/)
  await expect(page.locator('button[type=button].border-linkedin')).toContainText('Abundant')
  await expect(page.locator('button[type=button].border-linkedin')).toContainText('$799/mo')
  void errors
})

test('services show which package includes them', async ({ page, errors }) => {
  await page.goto('/services')
  await expect(page.getByRole('heading', { name: 'AI Speed-to-Lead Replies' })).toBeVisible()
  await expect(page.getByText('Faithful · $349/mo').first()).toBeVisible()
  await expect(page.getByText('Abundant · $799/mo').first()).toBeVisible()
  void errors
})
