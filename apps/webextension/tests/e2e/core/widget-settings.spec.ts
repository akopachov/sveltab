import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test('settings popup appears', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const workspacePage = new WorkspacePage(page);
  await expect(workspacePage.ToggleWorkspaceLockButton).toBeVisible();
  await workspacePage.ToggleWorkspaceLockButton.click();
  await workspacePage.WidgetSection.selectWidgetByType('search');
  await workspacePage.WidgetSection.openWidgetSettings();

  await expect(workspacePage.WidgetSection.WidgetSettingsPopup).toBeVisible();
  await expect(workspacePage.WidgetSection.WidgetSettingsPopup).not.toBeEmpty();
});

test('delete button deletes widget if confirmed', async ({ page, browserName }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const workspacePage = new WorkspacePage(page);
  await workspacePage.ToggleWorkspaceLockButton.click();
  const widgetLocator = await workspacePage.WidgetSection.selectWidgetByType('search');
  await workspacePage.WidgetSection.deleteWidget();
  await expect(widgetLocator).toHaveCount(0);

  await workspacePage.reload(browserName);
  await expect(widgetLocator).toHaveCount(0);
});

test('delete button does not delete widget if not confirmed', async ({ page, browserName }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const workspacePage = new WorkspacePage(page);
  await workspacePage.ToggleWorkspaceLockButton.click();
  const widgetLocator = await workspacePage.WidgetSection.selectWidgetByType('search');
  await workspacePage.WidgetSection.deleteWidget('cancel');
  await expect(widgetLocator).toHaveCount(1);

  await workspacePage.reload(browserName);
  await expect(widgetLocator).toHaveCount(1);
});
