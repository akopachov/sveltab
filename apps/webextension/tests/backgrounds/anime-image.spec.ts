import { Backgrounds } from '$backgrounds';
import { test, expect } from '@playwright/test';
import { minutesToMilliseconds } from 'date-fns';

test.setTimeout(minutesToMilliseconds(1));
test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
  await page.locator('#cbxBackgroundType').selectOption(providerIndex.toString());
  await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(/(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi),
  ]);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent('https://tc.alcy.cc/i/')),
  );
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});
