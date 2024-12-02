import { test } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

const TestImageUrl = 'https://picsum.photos/800/600';

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('static-image', async () => {
    await page.locator('#cbxStaticImageBgProvider_Settings_Url').fill(TestImageUrl);
  });

  await workspacePage.expectBackgroundImageToLoad(TestImageUrl);
});
