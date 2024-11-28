import { test, expect } from '@playwright/test';

test('settings popup appears', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#btnMainMenu');
  const toggleLockWorkspaceLocator = page.locator('#btnToggleLockWorkspace');
  await expect(toggleLockWorkspaceLocator).toBeVisible();
  await toggleLockWorkspaceLocator.click();
  const widgetSearchLocator = page.locator('.widget_search');
  await widgetSearchLocator.waitFor({ state: 'visible' });
  await widgetSearchLocator.click({ delay: 100 });
  const widgetSettingsBtnLocator = page.locator('.btn_widget-settings');
  await widgetSettingsBtnLocator.waitFor({ state: 'visible' });
  await widgetSettingsBtnLocator.click();
  const widgetSettingsPopupLocator = page.locator('#ctrWidgetSettingsPopup');
  await expect(widgetSettingsPopupLocator).toBeVisible();
  await expect(widgetSettingsPopupLocator).not.toBeEmpty();
});

test('delete button is deletes widget if confirmed', async ({ page, browserName }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#btnMainMenu');
  const toggleLockWorkspaceLocator = page.locator('#btnToggleLockWorkspace');
  toggleLockWorkspaceLocator.waitFor({ state: 'visible' });
  await toggleLockWorkspaceLocator.click();
  const widgetSearchLocator = page.locator('.widget_search');
  await widgetSearchLocator.waitFor({ state: 'visible' });
  await widgetSearchLocator.click({ delay: 100 });
  const widgetDeleteBtnLocator = page.locator('.btn_widget-delete');
  await widgetDeleteBtnLocator.waitFor({ state: 'visible' });
  await widgetDeleteBtnLocator.click();
  const modalLocator = page.locator('.modal');
  await modalLocator.waitFor({ state: 'visible' });
  const modalConfirmButtonLocator = page.locator('.modal .modal-footer .btn:nth-of-type(2)');
  await expect(modalConfirmButtonLocator).toBeVisible();
  await modalConfirmButtonLocator.click();
  await expect(widgetSearchLocator).toHaveCount(0);

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

  if (browserName === 'firefox') {
    await page.waitForTimeout(10000);
  }
  await page.reload({ waitUntil: 'networkidle' });
  await expect(widgetSearchLocator).toHaveCount(0);
});

test('delete button is not deleting widget if cancelled', async ({ page, browserName }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#btnMainMenu');
  const toggleLockWorkspaceLocator = page.locator('#btnToggleLockWorkspace');
  toggleLockWorkspaceLocator.waitFor({ state: 'visible' });
  await toggleLockWorkspaceLocator.click();
  const widgetSearchLocator = page.locator('.widget_search');
  await widgetSearchLocator.waitFor({ state: 'visible' });
  await widgetSearchLocator.click({ delay: 100 });
  const widgetDeleteBtnLocator = page.locator('.btn_widget-delete');
  await widgetDeleteBtnLocator.waitFor({ state: 'visible' });
  await widgetDeleteBtnLocator.click();
  const modalLocator = page.locator('.modal');
  await modalLocator.waitFor({ state: 'visible' });
  const modalCancelButtonLocator = page.locator('.modal .modal-footer .btn:nth-of-type(1)');
  await expect(modalCancelButtonLocator).toBeVisible();
  await modalCancelButtonLocator.click();
  await expect(widgetSearchLocator).toHaveCount(1);

  page.on('dialog', async dialog => {
    await page.waitForTimeout(500);
    await dialog.accept();
  });

  if (browserName === 'firefox') {
    await page.waitForTimeout(10000);
  }
  await page.reload({ waitUntil: 'networkidle' });
  await expect(widgetSearchLocator).toHaveCount(1);
});
