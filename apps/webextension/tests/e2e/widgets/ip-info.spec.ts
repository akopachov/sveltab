import { test, expect } from '@playwright/test';

test(`loads info`, async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiWidgetsCatalog').click();
  const [, , response] = await Promise.all([
    page.locator('#wcipWidget_ip-info').click(),
    page.locator('.widget_ip-info').waitFor({ state: 'visible' }),
    page.waitForResponse(/https:\/\/get.geojs.io\/.+/),
  ]);

  await expect(response.ok()).toBe(true);

  const ipLocator = page.locator('.widget_ip-info .ip');
  await expect(ipLocator).not.toBeNull();
  await expect(ipLocator).not.toBeEmpty();
  await expect(ipLocator).not.toHaveText('---');

  const asnLocator = page.locator('.widget_ip-info .asn');
  await expect(asnLocator).toHaveText(/\d+/);
  await expect(asnLocator).toHaveAttribute('href', /https:\/\/bgpview.io\/asn\/\d+/);

  const orgLocator = page.locator('.widget_ip-info .org');
  await expect(orgLocator).not.toBeNull();
  await expect(orgLocator).not.toBeEmpty();
  await expect(orgLocator).not.toHaveText('---');
});
