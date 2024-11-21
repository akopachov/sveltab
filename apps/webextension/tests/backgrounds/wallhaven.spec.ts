import { Backgrounds } from '$backgrounds';
import { test, expect } from '@playwright/test';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'wallhaven');
  await page.locator('#cbxBackgroundType').selectOption(providerIndex.toString());
  await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(/(https:\/\/wallhaven.cc\/api\/)|(https%3A%2F%2Fwallhaven\.cc%2Fapi%2F)/gi),
  ]);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});
