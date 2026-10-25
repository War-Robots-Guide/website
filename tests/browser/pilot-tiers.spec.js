import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync(new URL('../../src/data/pilot_tiers.json', import.meta.url), 'utf8'));

async function activate(page, clicks = 4, name = 'CrimsonHawk') {
  const credit = page.locator('footer').getByText(name, { exact: true });
  for (let i = 0; i < clicks; i++) await credit.click();
}

const pilotTab = page => page.getByRole('button', { name: 'Pilots', exact: true });

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  // Rendering and activation must work even when the source is unreachable.
  await page.route('https://docs.google.com/**', route => route.abort());
});

test('four CrimsonHawk clicks reveal pilots until reload, with searchable source order', async ({ page }) => {
  let sourceRequests = 0;
  page.on('request', request => { if (request.url().startsWith('https://docs.google.com/')) sourceRequests++; });
  await page.goto('/tiers');
  await expect(pilotTab(page)).toHaveCount(0);
  await activate(page, 3);
  await expect(pilotTab(page)).toHaveCount(0);
  await activate(page, 1);
  await expect(pilotTab(page)).toBeVisible();
  await pilotTab(page).click();
  await expect(page.locator('.pilot-tier-label')).toHaveText(snapshot.tiers.map(tier => tier.label));
  await expect(page.getByRole('link', { name: 'View source spreadsheet' })).toHaveAttribute('href', snapshot.sourceUrl);
  await expect(page.getByText('Tier Tag Guide', { exact: true })).toHaveCount(0);
  const name = snapshot.tiers[0].items[0].name;
  await page.getByPlaceholder('Search pilots in tier lists...').fill(name.toUpperCase());
  const names = await page.locator('.pilot-tier-name').allTextContents();
  expect(names.length).toBeGreaterThan(0);
  expect(names.every(value => value.toLowerCase().includes(name.toLowerCase()))).toBe(true);
  expect(sourceRequests).toBe(0);
  await page.getByRole('button', { name: 'Robots', exact: true }).click();
  await expect(page.getByPlaceholder('Search robots in tier lists...')).toHaveValue('');
  await page.getByRole('button', { name: /^View details for / }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close modal' }).click();
  await page.reload();
  await expect(pilotTab(page)).toHaveCount(0);
});

test('activation from the homepage survives in-app navigation', async ({ page }) => {
  await page.goto('/');
  await activate(page);
  await page.getByRole('link', { name: 'Tier Lists', exact: true }).click();
  await pilotTab(page).click();
  await expect(page.locator('.pilot-tier-row').first()).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('link', { name: 'Tier Lists', exact: true }).click();
  await expect(pilotTab(page)).toBeVisible();
});

test('Adazahi activation does not unlock pilot rankings', async ({ page }) => {
  await page.goto('/tiers');
  await activate(page, 8, 'Adazahi');
  await expect(page.getByTestId('adazahi-easter-egg')).toBeVisible();
  await expect(pilotTab(page)).toHaveCount(0);
});

test('pilot labels and placeholders remain usable at the current viewport', async ({ page }, testInfo) => {
  // Abort all actual pilot artwork requests to exercise the runtime fallback.
  await page.route('**/images/items/pilot_*', route => route.abort());
  await page.goto('/tiers');
  await activate(page);
  await pilotTab(page).click();
  const firstRow = page.locator('.pilot-tier-row').first();
  await expect(firstRow.locator('.pilot-portrait-placeholder').first()).toBeVisible();
  await expect(page.locator('.pilot-tier-label')).toHaveText(snapshot.tiers.map(tier => tier.label));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.pilot-tier-name').first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('pilot-tiers.png'), animations: 'disabled' });
  await firstRow.screenshot({ path: testInfo.outputPath('first-pilot-tier.png'), animations: 'disabled' });
});
