import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial', retries: 3 });

const GetApiCallRegex = () => /https%3A%2F%2Fwww.bing.com%2FHPImageArchive\.aspx/gi;

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

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

test('do not send api call after page reload', async ({ page, browserName }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // No need to select the provider, as Bing is the default provider

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

  if (browserName === 'firefox') {
    await page.waitForTimeout(10000);
  }

  await page.reload();
  let timeoutFired = false;
  try {
    await page.waitForRequest(GetApiCallRegex(), { timeout: 5000 });
  } catch (e) {
    timeoutFired = true;
  }
  expect(timeoutFired).toBe(true);
});
