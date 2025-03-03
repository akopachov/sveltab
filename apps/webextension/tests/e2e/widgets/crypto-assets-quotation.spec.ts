import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test('loads default asset info', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const widgetLocator = await workspacePage.addNewWidget('crypto-asset-quotation');
  await page.waitForLoadState('networkidle');

  const currentPriceLocator = widgetLocator.locator('.current-price');
  await currentPriceLocator.waitFor({ state: 'visible' });
  await expect(currentPriceLocator).toHaveText(/Bitcoin \(BTC\):\s+\$[0-9,.]+/);

  const chartLocator = widgetLocator.locator('.chart svg');
  await expect(chartLocator).toBeVisible();
});
