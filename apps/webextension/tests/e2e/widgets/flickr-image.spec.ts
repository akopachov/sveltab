import { test, expect } from '../fixtures';
import { WorkspacePage } from '../pom/workspace';

test('loads image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const widgetLocator = await workspacePage.addNewWidget('flickr-image');
  await page.waitForLoadState('networkidle');

  const linkLocator = widgetLocator.locator('a');
  await expect(linkLocator).toHaveAttribute('href', /https:\/\/www\.flickr\.com\/photos\/.+\/.+/);
  const imageLocator = widgetLocator.locator('a img');
  await expect(imageLocator).toHaveAttribute('src', /https:\/\/.+/);
  await expect(imageLocator).toImageLoaded();
});
