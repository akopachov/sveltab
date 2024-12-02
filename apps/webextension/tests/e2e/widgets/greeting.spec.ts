import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

const GetApiCallRegex = () => /https:\/\/cdn.statically.io\/gh\/akopachov\/greetings@master\/.+/;

test(`loads greeting initially`, async ({ page }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const response = await page.waitForResponse(GetApiCallRegex());
  await expect(response.ok()).toBe(true);

  await page.waitForLoadState('networkidle');

  const widgetLocator = workspacePage.WidgetSection.getWidgetLocatorByType('greeting');
  const greetingTextLocator = widgetLocator.locator('.greeting-text');
  await greetingTextLocator.waitFor({ state: 'visible' });
  await expect(greetingTextLocator).not.toBeNull();
  await expect(greetingTextLocator).not.toBeEmpty();
});

test(`does not load greeting again when page reloads`, async ({ page, browserName }) => {
  await page.goto('/');
  const workspacePage = new WorkspacePage(page);
  const response = await page.waitForResponse(GetApiCallRegex());
  await expect(response.ok()).toBe(true);

  await page.waitForLoadState('networkidle');

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
