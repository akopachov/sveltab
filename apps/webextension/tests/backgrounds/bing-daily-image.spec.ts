import { test, expect } from '@playwright/test';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.waitForResponse(/https%3A%2F%2Fwww.bing.com%2FHPImageArchive\.aspx/gi);

  // No need to select the provider, as Bing is the default provider

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent('https://bing.com')),
  );
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});
