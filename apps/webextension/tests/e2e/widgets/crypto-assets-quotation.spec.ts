import { test, expect } from '@playwright/test';

test('loads default asset info', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiWidgetsCatalog').click();
  await Promise.all([
    page.locator('#wcipWidget_crypto-asset-quotation').click(),
    page.locator('.widget_crypto-asset-quotation').waitFor({ state: 'visible' }),
    page.waitForLoadState('networkidle'),
  ]);

  const currentPriceLocator = page.locator('.widget_crypto-asset-quotation .current-price');
  await currentPriceLocator.waitFor({ state: 'visible' });
  await expect(currentPriceLocator).toHaveText(/Bitcoin \(BTC\):\s+\$[0-9,.]+/);

  const chartLocator = page.locator('.widget_crypto-asset-quotation .chart canvas');
  await expect(chartLocator).toBeVisible();
});
