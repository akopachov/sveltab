import { AnimeTopics } from '$backgrounds/anime-image/api';
import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../../pom/workspace';

test.slow();
test.describe.configure({ mode: 'serial', retries: 5 });

const GetApiCallRegex = () => /(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi;

test('sets background image', async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const [_, response] = await Promise.all([
    workspacePage.selectBackgroundProvider('anime-image'),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.text();
  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl.trim())));
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

const allTopics = Object.values(AnimeTopics);
for (const topic of allTopics) {
  test(`sets background from the topic ${topic}`, async ({ page }) => {
    await page.goto('/');
    const workspacePage = new WorkspacePage(page);
    await Promise.all([page.waitForResponse(GetApiCallRegex()), workspacePage.selectBackgroundProvider('anime-image')]);

    const [response] = await Promise.all([
      page.waitForResponse(GetApiCallRegex()),
      workspacePage.selectBackgroundProvider('anime-image', async () => {
        await page.locator('#cbxAnimeImageBgProvider_Settings_Topic').selectOption(topic);
      }),
    ]);

    expect(response.ok()).toBe(true);
    expect(response.url()).toMatch(new RegExp(`alcy\\.cc(\\/|%2F)${topic}(\\/|%2F)`));

    const imageUrl = await response.text();
    await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl.trim())));
  });
}

test('background image is not changing on refresh', async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);

  const [_, response] = await Promise.all([
    workspacePage.selectBackgroundProvider('anime-image'),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.text();
  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl.trim())));

  await workspacePage.reload(browserName);

  await workspacePage.expectBackgroundImageToLoad(expect.stringContaining(encodeURIComponent(imageUrl.trim())));
});
