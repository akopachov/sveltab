import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test.describe.configure({ mode: 'serial', retries: 3 });

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');

  // No need to select the provider, as Bing is the default provider

  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent('https://bing.com')));
});

test('do not send api call after page reload', async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');

  // No need to select the provider, as Bing is the default provider

  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent('https://bing.com')));

  await workspacePage.reload(browserName);

  let timeoutFired = false;
  try {
    await page.waitForRequest(/https%3A%2F%2Fwww.bing.com%2FHPImageArchive\.aspx/gi, { timeout: 5000 });
  } catch (e) {
    timeoutFired = true;
  }
  expect(timeoutFired).toBe(true);

  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent('https://bing.com')));
});
