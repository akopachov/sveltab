import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test(`loads advice`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');
  const widgetLocator = await workspacePage.WidgetSection.getWidgetLocatorByType('advice-slip');

  const [, response] = await Promise.all([
    workspacePage.addNewWidget('advice-slip'),
    page.waitForResponse('https://api.adviceslip.com/advice'),
  ]);

  await expect(response.ok()).toBe(true);

  await expect(widgetLocator).toHaveCount(1);

  const adviceLocator = widgetLocator.locator('.advice');
  await expect(adviceLocator).not.toBeNull();
  await expect(adviceLocator).not.toBeEmpty();
});
