import { Backgrounds } from '$backgrounds';
import { test, expect } from '@playwright/test';

const testImageUrl = 'https://picsum.photos/800/600';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'static-image');
  await page.locator('#cbxBackgroundType').selectOption(providerIndex.toString());

  await page.locator('#cbxStaticImageBgProvider_Settings_Url').fill(testImageUrl);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute('src', testImageUrl);
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});
