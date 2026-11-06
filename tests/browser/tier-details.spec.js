import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';

function countBrightTextPixels(screenshot) {
  const { data } = PNG.sync.read(screenshot);
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Titles and rationales use near-white text on the dark modal surface.
    if (data[i] >= 200 && data[i + 1] >= 200 && data[i + 2] >= 200) count++;
  }
  return count;
}

const categories = [
  'Robots', 'Titans', 'Drones', 'Motherships', 'Mothership Turrets',
  'Robot Weapons', 'Titan Weapons',
];

for (const category of categories) {
  test(`${category} detail text stays readable above the artwork`, async ({ page }, testInfo) => {
    // Avoid external font availability changing rendering or delaying the test.
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto('/tiers');
    await page.getByRole('button', { name: category, exact: true }).click();
    await page.getByRole('button', { name: /^View details for / }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.modal-faded-bg')).toBeVisible();
    const textRegions = [
      ['title', dialog.getByRole('heading')],
      ['rationale', dialog.locator('.modal-body p').first()],
    ];

    for (const [name, region] of textRegions) {
      await test.step(`${name} retains its visible text contrast`, async () => {
        const actual = await region.screenshot({ animations: 'disabled' });
        // Use the same text and browser as a reference, with only the decorative
        // layer hidden. This avoids baselines tied to changing guide content,
        // downloaded artwork, operating-system fonts, or a specific z-index fix.
        const referenceStyle = await page.addStyleTag({
          content: '.modal-faded-bg { visibility: hidden !important; }',
        });
        const reference = await region.screenshot({ animations: 'disabled' });
        await referenceStyle.evaluate(element => element.remove());

        const referencePixels = countBrightTextPixels(reference);
        const actualPixels = countBrightTextPixels(actual);
        expect(referencePixels, `${name} must contain visible light text`).toBeGreaterThan(20);
        if (actualPixels < referencePixels * 0.9) {
          await testInfo.attach(`${name}-actual`, { body: actual, contentType: 'image/png' });
          await testInfo.attach(`${name}-unobscured`, { body: reference, contentType: 'image/png' });
        }
        expect(actualPixels, `${name} is obscured by the decorative background`)
          .toBeGreaterThanOrEqual(referencePixels * 0.9);
      });
    }

    await dialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(dialog).not.toBeVisible();
  });
}

test('Robot detail background continues covering the popup when scrolled down', async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.setViewportSize({ width: 1280, height: 520 });
  await page.goto('/tiers');
  await page.getByRole('button', { name: 'Robots', exact: true }).click();
  await page.getByRole('button', { name: /^View details for / }).first().click();

  const dialog = page.getByRole('dialog');
  const modalContent = dialog.locator('.modal-content');
  const fadedBg = dialog.locator('.modal-faded-bg');
  await expect(modalContent).toBeVisible();
  await expect(fadedBg).toBeVisible();

  await dialog.locator('.detail-role-list').scrollIntoViewIfNeeded();

  const modalBox = await modalContent.boundingBox();
  const bgBox = await fadedBg.boundingBox();
  expect(bgBox.y).toBeLessThanOrEqual(modalBox.y + 2);
  expect(bgBox.y + bgBox.height).toBeGreaterThanOrEqual(modalBox.y + modalBox.height - 2);
});

