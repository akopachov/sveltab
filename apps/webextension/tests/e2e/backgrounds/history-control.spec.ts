import { Backgrounds } from '$backgrounds';
import { test, expect } from '@playwright/test';

test.slow();
test.describe.configure({ retries: 3 });

test(`history navigation is working`, async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'wallhaven');
  await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(/(https:\/\/wallhaven.cc\/api\/)|(https%3A%2F%2Fwallhaven\.cc%2Fapi%2F)/gi),
  ]);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });

  await page.locator('.drawer-backdrop').click();

  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);

  const originalSrc = (await imgBackgroundLocator.getAttribute('src')) || '';

  await expect(page.locator('#btnPreviousBackground')).toHaveCount(0);

  await Promise.all([
    page.locator('#btnNextBackground').click(),
    page.waitForResponse(r => r.url().includes(encodeURIComponent('https://w.wallhaven.cc'))),
  ]);

  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(page.locator('#btnPreviousBackground')).toBeVisible();

  const newSrc = (await imgBackgroundLocator.getAttribute('src')) || '';
  await expect(newSrc).not.toEqual(originalSrc);
  await page.locator('#btnPreviousBackground').click();
  await expect(imgBackgroundLocator).toHaveAttribute('src', originalSrc);
  await expect(page.locator('#btnPreviousBackground')).toHaveCount(0);

  await page.locator('#btnNextBackground').click();
  await expect(page.locator('#btnPreviousBackground')).toBeVisible();
  await expect(imgBackgroundLocator).toHaveAttribute('src', newSrc);

  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const anotherProviderIndex = Backgrounds.findIndex(b => b.settings.type === 'pexels');
  await page.selectOption('#cbxBackgroundType', anotherProviderIndex.toString());
  await page.locator('.drawer-backdrop').click();
  await expect(page.locator('#btnPreviousBackground')).toHaveCount(0);
});
