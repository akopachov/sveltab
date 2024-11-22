import { test, expect } from '@playwright/test';

test(`loads info`, async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const existingWidgetCount = await page.locator('.widget_random-quote').count();
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiWidgetsCatalog').click();
  const [, response] = await Promise.all([
    page.locator('#wcipWidget_random-quote').click(),
    page.waitForResponse('https://quoteslate.vercel.app/api/quotes/random'),
  ]);

  await expect(response.ok()).toBe(true);

  await expect(page.locator('.widget_random-quote')).toHaveCount(existingWidgetCount + 1);

  const quoteLocator = page.locator('.widget_random-quote .quote');
  for (const locator of await quoteLocator.all()) {
    await expect(locator).not.toBeNull();
    await expect(locator).not.toBeEmpty();
  }

  const authorLocator = page.locator('.widget_random-quote .author');
  for (const locator of await authorLocator.all()) {
    await expect(locator).not.toBeNull();
    await expect(locator).not.toBeEmpty();
  }
});
