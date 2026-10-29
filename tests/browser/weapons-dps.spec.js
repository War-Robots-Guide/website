import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.goto('/weapons');
  await expect(page.locator('.weapon-card').first()).toBeVisible();
});

test('the long DPS list avoids persistent animation and per-card backdrop surfaces', async ({ page }) => {
  // A full-height transformed ancestor plus hundreds of backdrop surfaces puts
  // pressure on older iOS WebContent processes, even when images are lazy loaded.
  await page.getByRole('heading', { name: 'Weapon DPS', exact: true }).evaluate(async element => {
    const root = element.closest('.page-hero').parentElement;
    await Promise.all(root.getAnimations().map(animation => animation.finished));
  });
  const rendering = await page.evaluate(() => {
    const root = document.querySelector('.weapons-tab-container').parentElement;
    const cards = [...document.querySelectorAll('.weapon-card')];
    const hasBackdrop = style => [style.backdropFilter, style.webkitBackdropFilter]
      .some(value => value && value !== 'none');
    return {
      transform: getComputedStyle(root).transform,
      willChange: getComputedStyle(root).willChange,
      cardBackdrops: cards.filter(card => [card, ...card.querySelectorAll('*')].some(element =>
        hasBackdrop(getComputedStyle(element)) || ['::before', '::after'].some(pseudo => {
          const style = getComputedStyle(element, pseudo);
          return !['none', 'normal'].includes(style.content) && hasBackdrop(style);
        })
      )).length,
    };
  });
  expect(rendering).toEqual({ transform: 'none', willChange: 'auto', cardBackdrops: 0 });
});

test('DPS cards remain usable through class changes, sorting, search, and navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const weaponClass of ['Heavy', 'Medium', 'Light', 'Alpha', 'Beta']) {
    await page.getByRole('button', { name: weaponClass, exact: true }).click();
    await page.getByRole('button', { name: 'Cycle DPS', exact: true }).click();
    const cards = page.locator('.weapon-card');
    const name = await cards.last().getByRole('heading').innerText();
    await cards.last().scrollIntoViewIfNeeded();
    await cards.last().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name, exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close modal' }).click();
    await page.getByPlaceholder(`Search ${weaponClass.toLowerCase()} weapons...`).fill(name);
    await expect(cards.first().getByRole('heading')).toHaveText(name);
    await page.getByRole('button', { name: 'Burst DPS', exact: true }).click();
  }
  await page.goto('/');
  await page.goto('/weapons');
  await expect(page.locator('.weapon-card').first()).toBeVisible();
  expect(errors).toEqual([]);
});

// Record and pause actual browser animations so their short entrance can be
// inspected deterministically, then resume them to check their final effects.
async function trackEntrances(page) {
  await page.addInitScript(() => {
    window.dpsEntrances = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      animation.pause();
      animation.currentTime = 0;
      window.dpsEntrances.push({ element: this, animation, scrollY: window.scrollY });
      return animation;
    };
  });
}

test('only initially visible elements enter, then release their effects without replaying', async ({ page }) => {
  await trackEntrances(page);
  // Include cards in the initial viewport on both layouts.
  await page.setViewportSize({ width: page.viewportSize().width, height: 1400 });
  await page.goto('/weapons');
  await expect.poll(() => page.evaluate(() => window.dpsEntrances.length)).toBeGreaterThan(0);

  const hero = page.locator('.page-hero');
  const cards = page.locator('.weapon-card');
  await expect.poll(() => hero.evaluate(element => element.getAnimations().length)).toBe(1);
  expect(await cards.first().evaluate(element => element.getAnimations().length)).toBe(1);
  expect(await cards.last().evaluate(element => element.getAnimations().length)).toBe(0);
  expect(await page.locator('.dashboard-grid').evaluate(element => element.getAnimations().length)).toBe(0);
  expect(await page.locator('.weapons-tab-container').evaluate(element => element.parentElement.getAnimations().length)).toBe(0);

  const entranceCount = await page.evaluate(() => {
    window.dpsEntrances.forEach(({ animation }) => animation.play());
    return window.dpsEntrances.length;
  });
  await expect.poll(() => page.evaluate(() => window.dpsEntrances.every(({ animation }) =>
    animation.playState === 'finished'
  ))).toBe(true);
  expect(await page.evaluate(() => window.dpsEntrances.every(({ element }) => {
    const style = getComputedStyle(element);
    return style.transform === 'none' && style.willChange === 'auto' && style.opacity === '1';
  }))).toBe(true);

  await cards.last().scrollIntoViewIfNeeded();
  expect(await cards.last().evaluate(element => element.getAnimations().length)).toBe(0);
  await page.getByRole('button', { name: 'Cycle DPS', exact: true }).click();
  await page.getByRole('button', { name: 'Medium', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Medium', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.dpsEntrances.length)).toBe(entranceCount);
});

test('reduced motion skips the DPS entrance', async ({ page }) => {
  await trackEntrances(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/weapons');
  await expect(page.locator('.weapon-card').first()).toBeVisible();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.dpsEntrances.length)).toBe(0);
});

test('the entrance starts before the first visible frame without flashing or restarting', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.addInitScript(() => {
    window.dpsFrames = [];
    window.dpsFramesComplete = false;
    let started;
    function sample() {
      const hero = document.querySelector('.page-hero');
      if (hero) {
        started ??= performance.now();
        window.dpsFrames.push({
          opacity: Number(getComputedStyle(hero).opacity),
          animations: hero.getAnimations().length,
        });
        if (performance.now() - started > 600) {
          window.dpsFramesComplete = true;
          return;
        }
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.goto('/weapons');
  // A throttled runner can finish this window with only two frames. Wait for
  // the sampler to finish instead of assuming a minimum rendering frame rate.
  await expect.poll(() => page.evaluate(() => window.dpsFramesComplete)).toBe(true);
  const frames = await page.evaluate(() => window.dpsFrames);
  expect(frames[0].animations).toBe(1);
  expect(frames[0].opacity).toBeLessThan(1);
  for (let index = 1; index < frames.length; index++) {
    expect(frames[index].opacity).toBeGreaterThanOrEqual(frames[index - 1].opacity);
  }
  expect(frames.at(-1)).toEqual({ opacity: 1, animations: 0 });
});

test('returning from a scrolled route animates the viewport after the route scroll reset', async ({ page }) => {
  await trackEntrances(page);
  await page.goto('/weapons');
  await expect(page.locator('.weapon-card').first()).toBeVisible();
  await page.getByRole('link', { name: 'Pilot Skills', exact: true }).evaluate(element => element.click());
  await expect(page.locator('.main-content .page-hero')).toBeVisible();
  await expect(page).toHaveURL(/\/pilots$/);
  await page.evaluate(() => {
    window.scrollTo(0, 1500);
    window.dpsEntrances = [];
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  // Preserve the old route's scroll position until the navigation itself runs.
  await page.getByRole('link', { name: 'Weapon DPS', exact: true }).evaluate(element => element.click());
  await expect.poll(() => page.evaluate(() => window.dpsEntrances.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.dpsEntrances.every(entry => entry.scrollY === 0))).toBe(true);
  expect(await page.locator('.page-hero').evaluate(element => element.getAnimations().length)).toBe(1);
  expect(await page.locator('.weapon-card').last().evaluate(element => element.getAnimations().length)).toBe(0);
});
