import { test, expect, orderSummary } from './fixtures'

test('pricing explains pay per lead for tiny businesses', async ({ page, errors }) => {
  await page.goto('/pricing#payg')
  const section = page.locator('#payg')
  await expect(section.getByRole('heading', { name: 'Pay As You Go: Pay Per Lead' })).toBeVisible()
  await expect(section).toContainText('aggregated annual turnover under $2 million')
  for (const price of ['$15', '$25', '$40']) await expect(section.getByText(price, { exact: true })).toBeVisible()
  await expect(section).toContainText('Leads you already pay another platform for')
  await expect(section).toContainText('Your first 3 leads are free.')
  void errors
})

test('pay per lead is blocked unless the business is tiny, has a valid ABN and declares it', async ({ page, errors }) => {
  await page.goto('/booking?service=100')
  const submit = page.getByRole('button', { name: /Confirm Booking/ })
  await expect(submit).toBeDisabled()

  await page.getByLabel('ABN').fill('51 824 753 556')
  await page.getByLabel('Aggregated annual turnover').selectOption('2to10m')
  await expect(page.getByText(/only for businesses with aggregated annual turnover under \$2 million/)).toBeVisible()
  await expect(submit).toBeDisabled()

  await page.getByLabel('Aggregated annual turnover').selectOption('under2m')
  await expect(submit).toBeDisabled() // declaration still needed
  await page.getByText('I declare my business').click()
  await expect(submit).toBeEnabled()

  await page.getByLabel('ABN').fill('51 824 753 557') // bad check digit
  await expect(page.getByText('Please enter a valid 11-digit ABN.')).toBeVisible()
  await expect(submit).toBeDisabled()
  void errors
})

test('pay per lead: nothing due today, estimate never above the cap', async ({ page, errors }) => {
  await page.goto('/booking?service=100')
  await expect.poll(() => orderSummary(page)).toContain('$0 today')
  // default estimate: 8 enquiries x $15 + 4 calls x $25 = $220
  expect(await orderSummary(page)).toContain('Estimated leads bill / month $220.00')
  await page.getByLabel('Monthly cap ($)').fill('150')
  await expect.poll(() => orderSummary(page)).toContain('Estimated leads bill / month $150.00')
  void errors
})

test('a tiny business can complete a pay-per-lead booking', async ({ page, errors }) => {
  await page.goto('/booking?service=100')
  await page.getByLabel('ABN').fill('51 824 753 556')
  await page.getByLabel('Aggregated annual turnover').selectOption('under2m')
  await page.getByText('I declare my business').click()
  await page.getByLabel('Preferred Date').fill('2026-12-01')
  await page.getByLabel('Preferred Time').selectOption('10:00 AM')
  await page.getByRole('button', { name: /Confirm Booking/ }).click()
  await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible()
  void errors
})
