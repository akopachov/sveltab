import { test, expect } from '../fixtures';
import { WorkspacePage } from '../pom/workspace';

test('manual favicon applies', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const workspacePage = new WorkspacePage(page);
  await workspacePage.MainMenu.click();
  await page.locator('#aiSettings').click();
  const settingsSection = page.locator('#aiSettings~.accordion-panel');
  await settingsSection.locator('.radio-label:has(input[name="favicon_manual"])').click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    settingsSection.locator('.file-button-btn:has(#faviconPreviewContainer)').click(),
  ]);
  await fileChooser.setFiles({
    name: 'favicon.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      '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',
      'base64',
    ),
  });
  const faviconPreviewContainer = settingsSection.locator('#faviconPreviewContainer');
  const previewImagesLocator = faviconPreviewContainer.locator('img');
  await expect(previewImagesLocator).toHaveCount(2);
  for (let previewImage of await previewImagesLocator.all()) {
    await expect(previewImage).toImageLoaded();
  }
});
