import { Backgrounds } from '$backgrounds';
import { test, expect } from '@playwright/test';

test('sets background image', async ({ page }) => {
  const testImageUrl = 'https://getsamplefiles.com/download/jpg/sample-5.jpg';

  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'static-image');
  await page.locator('#cbxBackgroundType').selectOption(providerIndex.toString());

  await page.locator('#divBackgroundProviderSettings input[type="url"]').fill(testImageUrl);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute('src', testImageUrl);
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});
