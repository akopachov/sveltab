import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test.slow();
test.describe.configure({ retries: 3 });

test(`history navigation is working`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('wallhaven');
  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );

  const originalSrc = (await workspacePage.BackgroundImage.getAttribute('src')) || '';

  await expect(workspacePage.PreviousBackgroundButton).toHaveCount(0);

  await Promise.all([
    workspacePage.MextBackgroundButton.click(),
    page.waitForResponse(r => r.url().includes(encodeURIComponent('https://w.wallhaven.cc'))),
  ]);

  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );

  await expect(workspacePage.PreviousBackgroundButton).toBeVisible();

  const newSrc = (await workspacePage.BackgroundImage.getAttribute('src')) || '';
  await expect(newSrc).not.toEqual(originalSrc);
  await workspacePage.PreviousBackgroundButton.click();
  await expect(workspacePage.BackgroundImage).toHaveAttribute('src', originalSrc);
  await expect(workspacePage.PreviousBackgroundButton).toHaveCount(0);

  await workspacePage.MextBackgroundButton.click();
  await expect(workspacePage.PreviousBackgroundButton).toBeVisible();
  await expect(workspacePage.BackgroundImage).toHaveAttribute('src', newSrc);

  await workspacePage.selectBackgroundProvider('pexels');

  await expect(workspacePage.PreviousBackgroundButton).toHaveCount(0);
});

test('history preserved after refresh', async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await workspacePage.selectBackgroundProvider('wallhaven');
  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );

  const [, response] = await Promise.all([
    workspacePage.MextBackgroundButton.click(),
    page.waitForResponse(r => r.url().includes(encodeURIComponent('https://w.wallhaven.cc'))),
  ]);

  await expect(response.ok()).toBe(true);

  await workspacePage.expectBackgroundImageToLoad(
    expect.stringContaining(encodeURIComponent('https://w.wallhaven.cc')),
  );

  const originalSrc = (await workspacePage.BackgroundImage.getAttribute('src')) || '';

  await workspacePage.reload(browserName);
  await page.waitForLoadState('networkidle');

  await workspacePage.expectBackgroundImageToLoad(originalSrc);
});
