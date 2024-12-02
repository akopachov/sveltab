import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('pexels');
  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining('https://images.pexels.com/photos/'));
});
