import { Backgrounds } from '$backgrounds';
import { AnimeTopics } from '$backgrounds/anime-image/api';
import { test, expect } from '@playwright/test';

test.slow();
test.describe.configure({ mode: 'serial', retries: 5 });

const GetApiCallRegex = () => /(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi;

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
  const [_, response] = await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.text();
  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent(imageUrl.trim())),
  );
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
});

test('do not send api call after page reload', async ({ page, browserName }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
  await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

  if (browserName === 'firefox') {
    await page.waitForTimeout(10000);
  }

  await page.reload();
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
    await page.locator('#btnMainMenu').click();
    await page.locator('#aiBackgroundCatalog').click();
    const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
    await Promise.all([
      page.waitForResponse(GetApiCallRegex()),
      page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    ]);

    const imgBackgroundLocator = page.locator('#imgBackground[src]');
    await imgBackgroundLocator.waitFor({ state: 'visible' });
    await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);

    const [response, _] = await Promise.all([
      page.waitForResponse(GetApiCallRegex()),
      page.locator('#cbxAnimeImageBgProvider_Settings_Topic').selectOption(topic),
    ]);

    await expect(response.ok()).toBe(true);
    await expect(response.url()).toMatch(new RegExp(`alcy\\.cc(\\/|%2F)${topic}(\\/|%2F)`));

    const imageUrl = await response.text();
    await expect(imgBackgroundLocator).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(imageUrl.trim())),
    );
    await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
    await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);
  });
}

test('background image is not changing on refresh', async ({ page, browserName }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
  const [_, response] = await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(GetApiCallRegex()),
  ]);

  await expect(response.ok()).toBe(true);
  const imageUrl = await response.text();
  const imgBackgroundLocator = page.locator('#imgBackground[src]');
  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent(imageUrl.trim())),
  );
  await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);
  await expect(imgBackgroundLocator).not.toHaveJSProperty('naturalWidth', 0);

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

  if (browserName === 'firefox') {
    await page.waitForTimeout(10000);
  }

  await page.reload();
  await page.waitForLoadState('networkidle');

  await imgBackgroundLocator.waitFor({ state: 'visible' });
  await expect(imgBackgroundLocator).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent(imageUrl.trim())),
  );
});
