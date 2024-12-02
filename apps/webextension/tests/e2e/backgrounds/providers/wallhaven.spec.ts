import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('wallhaven');
  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );
});
