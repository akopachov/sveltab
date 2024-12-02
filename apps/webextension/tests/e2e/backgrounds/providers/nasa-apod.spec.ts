import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('nasa-apod');
  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://apod.nasa.gov/apod/image/')),
  );
});
