import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test(`loads info`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const [widgetLocator, response] = await Promise.all([
    workspacePage.addNewWidget('ip-info'),
    page.waitForResponse(/https:\/\/get.geojs.io\/.+/),
  ]);

  await expect(response.ok()).toBe(true);

  const ipLocator = widgetLocator.locator('.ip');
  await expect(ipLocator).not.toBeNull();
  await expect(ipLocator).not.toBeEmpty();
  await expect(ipLocator).not.toHaveText('---');

  const asnLocator = widgetLocator.locator('.asn');
  await expect(asnLocator).toHaveText(/\d+/);
  await expect(asnLocator).toHaveAttribute('href', /https:\/\/bgpview.io\/asn\/\d+/);

  const orgLocator = widgetLocator.locator('.org');
  await expect(orgLocator).not.toBeNull();
  await expect(orgLocator).not.toBeEmpty();
  await expect(orgLocator).not.toHaveText('---');

  const locationLocator = widgetLocator.locator('.location');
  await expect(locationLocator).not.toBeNull();
  await expect(locationLocator).not.toBeEmpty();
  await expect(locationLocator).not.toHaveText('---');
});
