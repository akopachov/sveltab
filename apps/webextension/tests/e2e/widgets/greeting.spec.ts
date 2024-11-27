import { test, expect } from '@playwright/test';

const GetApiCallRegex = () => /https:\/\/cdn.statically.io\/gh\/akopachov\/greetings@master\/.+/;

test(`loads greeting initially`, async ({ page }) => {
  await page.goto('/');
  const response = await page.waitForResponse(GetApiCallRegex());
  await expect(response.ok()).toBe(true);

  await page.waitForLoadState('networkidle');

  const greetingTextLocator = page.locator('.widget_greeting .greeting-text');
  await greetingTextLocator.waitFor({ state: 'visible' });
  await expect(greetingTextLocator).not.toBeNull();
  await expect(greetingTextLocator).not.toBeEmpty();
});

test(`do not load greeting again when reload`, async ({ page }) => {
  await page.goto('/');
  const response = await page.waitForResponse(GetApiCallRegex());
  await expect(response.ok()).toBe(true);

  await page.waitForLoadState('networkidle');

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

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
