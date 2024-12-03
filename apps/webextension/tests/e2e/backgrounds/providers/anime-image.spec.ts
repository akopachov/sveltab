import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test.slow();
test.describe.configure({ mode: 'serial', retries: 5 });

const GetApiCallRegex = () => /https:\/\/pic\.re\/image\.json.+/gi;

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const [_, response] = await Promise.all([
    workspacePage.selectBackgroundProvider('anime-image'),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.json().then(r => r.file_url);
  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl)));
});

test('do not send api call after page reload', async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  await Promise.all([workspacePage.selectBackgroundProvider('anime-image'), page.waitForResponse(GetApiCallRegex())]);

  await workspacePage.expectBackgroundImageToLoad();

  await workspacePage.reload(browserName);

  let timeoutFired = false;
  try {
    await page.waitForRequest(GetApiCallRegex(), {
      timeout: 5000,
    });
  } catch (e) {
    timeoutFired = true;
  }
  expect(timeoutFired).toBe(true);
});

test('background image is not changing on refresh', async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);

  const [_, response] = await Promise.all([
    workspacePage.selectBackgroundProvider('anime-image'),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.json().then(r => r.file_url);
  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl)));

  await workspacePage.reload(browserName);

  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl)));
});
