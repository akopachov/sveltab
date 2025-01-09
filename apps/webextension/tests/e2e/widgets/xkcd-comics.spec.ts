import { test, expect } from '../fixtures';
import { WorkspacePage } from '../pom/workspace';

test(`load comics`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await page.waitForLoadState('networkidle');
  const widgetLocator = await workspacePage.WidgetSection.getWidgetLocatorByType('xkcd-comics');

  const [, response] = await Promise.all([
    workspacePage.addNewWidget('xkcd-comics'),
    page.waitForResponse(r => r.url().includes(encodeURIComponent('https://xkcd.com/info.0.json'))),
  ]);

  await expect(response.ok()).toBe(true);
  const responseJson = await response.json();

  await expect(widgetLocator).toHaveCount(1);

  const linkLocator = widgetLocator.locator('a');
  await expect(linkLocator).toHaveAttribute('href', /https:\/\/xkcd.com\/.+/);
  const imageLocator = widgetLocator.locator('a img');
  await expect(imageLocator).toHaveAttribute('src', responseJson.img);
  await expect(imageLocator).toImageLoaded();
});
