import type { Widgets } from '$widgets';
import { expect, type Locator, type Page } from '@playwright/test';

export type WidgetType = (typeof Widgets)[number]['settings']['type'];

export class WidgetSection {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.WidgetSettingsPopup = page.locator('#ctrWidgetSettingsPopup');
  }

  readonly WidgetSettingsPopup: Locator;

  getWidgetLocatorByType(type: WidgetType) {
    return this.#page.locator(`.widget_${type}`);
  }

  async selectWidgetByType(type: WidgetType) {
    const locator = this.getWidgetLocatorByType(type);
    await locator.waitFor({ state: 'visible' });
    await locator.click({ delay: 100 });
    return locator;
  }

  async openWidgetSettings() {
    const locator = this.#page.locator('.btn_widget-settings');
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async deleteWidget(confirmation: 'confirm' | 'cancel' = 'confirm') {
    const widgetDeleteBtnLocator = this.#page.locator('.btn_widget-delete');
    await widgetDeleteBtnLocator.waitFor({ state: 'visible' });
    await widgetDeleteBtnLocator.click();
    const modalLocator = this.#page.locator('.modal');
    await modalLocator.waitFor({ state: 'visible' });
    if (confirmation === 'confirm') {
      const modalConfirmButtonLocator = this.#page.locator('.modal .modal-footer .btn:nth-of-type(2)');
      await expect(modalConfirmButtonLocator).toBeVisible();
      await modalConfirmButtonLocator.click();
    } else if (confirmation === 'cancel') {
      const modalCancelButtonLocator = this.#page.locator('.modal .modal-footer .btn:nth-of-type(1)');
      await expect(modalCancelButtonLocator).toBeVisible();
      await modalCancelButtonLocator.click();
    }
  }
}
