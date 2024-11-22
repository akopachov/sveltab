import { test, expect } from '@playwright/test';

test(`loads info`, async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiWidgetsCatalog').click();
  const [, , response] = await Promise.all([
    page.locator('#wcipWidget_ip-info').click(),
    page.locator('.widget_ip-info').waitFor({ state: 'visible' }),
    page.waitForResponse('https://ipapi.co/json/'),
  ]);

  await expect(response.ok()).toBe(true);

  const ipLocator = page.locator('.widget_ip-info .ip');
  await expect(ipLocator).not.toBeNull();
  await expect(ipLocator).not.toBeEmpty();
  await expect(ipLocator).not.toHaveText('---');

  const networkLocator = page.locator('.widget_ip-info .network');
  await expect(networkLocator).not.toBeNull();
  await expect(networkLocator).not.toBeEmpty();
  await expect(networkLocator).not.toHaveText('---');

  const orgLocator = page.locator('.widget_ip-info .org');
  await expect(orgLocator).not.toBeNull();
  await expect(orgLocator).not.toBeEmpty();
  await expect(orgLocator).not.toHaveText('---');
});
