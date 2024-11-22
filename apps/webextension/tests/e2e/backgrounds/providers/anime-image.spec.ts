import { Backgrounds } from '$backgrounds';
import { AnimeTopics } from '$backgrounds/anime-image/api';
import { test, expect } from '@playwright/test';

test.slow();
test.describe.configure({ mode: 'serial', retries: 3 });

test('sets background image', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btnMainMenu').click();
  await page.locator('#aiBackgroundCatalog').click();
  const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
  const [_, response] = await Promise.all([
    page.selectOption('#cbxBackgroundType', providerIndex.toString()),
    page.waitForResponse(/(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi),
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

const allTopics = Object.values(AnimeTopics);
for (const topic of allTopics) {
  test(`sets background from the topic ${topic}`, async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnMainMenu').click();
    await page.locator('#aiBackgroundCatalog').click();
    const providerIndex = Backgrounds.findIndex(b => b.settings.type === 'anime-image');
    await Promise.all([
      page.selectOption('#cbxBackgroundType', providerIndex.toString()),
      page.waitForResponse(/(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi),
    ]);

    const imgBackgroundLocator = page.locator('#imgBackground[src]');
    await imgBackgroundLocator.waitFor({ state: 'visible' });
    await expect(imgBackgroundLocator).toHaveJSProperty('complete', true);

    const [_, response] = await Promise.all([
      page.locator('#cbxAnimeImageBgProvider_Settings_Topic').selectOption(topic),
      page.waitForResponse(/(https:\/\/t\.alcy\.cc\/.+\/\?json)|(https%3A%2F%2Ft\.alcy\.cc%2F.+%2F%3Fjson)/gi),
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
