import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test(`loads bible verse`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');
  const widgetLocator = await workspacePage.WidgetSection.getWidgetLocatorByType('bible-verse');

  const [, response] = await Promise.all([
    workspacePage.addNewWidget('bible-verse'),
    page.waitForResponse(/https:\/\/bible.helloao.org\/api\/.+\/.+\/\d+\.json/),
  ]);

  await expect(response.ok()).toBe(true);

  await expect(widgetLocator).toHaveCount(1);

  const verseLocator = widgetLocator.locator('.verse');
  await expect(verseLocator).not.toBeNull();
  await expect(verseLocator).not.toBeEmpty();

  const refLocator = widgetLocator.locator('.ref');
  await expect(refLocator).not.toBeNull();
  await expect(refLocator).not.toBeEmpty();
});
