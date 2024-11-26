import { test, expect } from '@playwright/test';

test('loads image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiWidgetsCatalog').click();
  await Promise.all([
    page.locator('#wcipWidget_flickr-image').click(),
    page.locator('.widget_flickr-image').waitFor({ state: 'visible' }),
  ]);

  const linkLocator = page.locator('.widget_flickr-image a');
  await expect(linkLocator).toHaveAttribute('href', /https:\/\/www\.flickr\.com\/photos\/.+\/.+/);
  const imageLocator = page.locator('.widget_flickr-image a img');
  await expect(imageLocator).toHaveAttribute('src', /https:\/\/.+/);
  await expect(imageLocator).toHaveJSProperty('complete', true);
  await expect(imageLocator).not.toHaveJSProperty('naturalWidth', 0);
});
