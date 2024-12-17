import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test(`loads quote`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');
  const widgetLocator = await workspacePage.WidgetSection.getWidgetLocatorByType('random-quote');
  const existingWidgetCount = await widgetLocator.count();

  const [, response] = await Promise.all([
    workspacePage.addNewWidget('random-quote'),
    page.waitForResponse('https://quoteslate.vercel.app/api/quotes/random'),
  ]);

  await expect(response.ok()).toBe(true);

  await expect(widgetLocator).toHaveCount(existingWidgetCount + 1);

  const quoteLocator = widgetLocator.locator('.quote');
  for (const locator of await quoteLocator.all()) {
    await expect(locator).not.toBeNull();
    await expect(locator).not.toBeEmpty();
  }

  const authorLocator = widgetLocator.locator('.author');
  for (const locator of await authorLocator.all()) {
    await expect(locator).not.toBeNull();
    await expect(locator).not.toBeEmpty();
  }
});
