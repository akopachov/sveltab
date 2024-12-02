import { Backgrounds } from '$backgrounds';
import { type Page, type Locator } from '@playwright/test';
import { expect } from '../fixtures';
import { WidgetSection, type WidgetType } from './widget';

export type BackgroundProviderName = (typeof Backgrounds)[number]['settings']['type'];

export class WorkspacePage {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.MainMenu = page.locator('#btnMainMenu');
    this.BackgroundImage = page.locator('#imgBackground[src]');
    this.PreviousBackgroundButton = page.locator('#btnPreviousBackground');
    this.MextBackgroundButton = page.locator('#btnNextBackground');
    this.ToggleWorkspaceLockButton = page.locator('#btnToggleLockWorkspace');
    this.WidgetSection = new WidgetSection(page);
  }

  readonly MainMenu: Locator;
  readonly BackgroundImage: Locator;
  readonly PreviousBackgroundButton: Locator;
  readonly MextBackgroundButton: Locator;
  readonly ToggleWorkspaceLockButton: Locator;
  readonly WidgetSection: WidgetSection;

  async selectBackgroundProvider(
    name: BackgroundProviderName,
    providerSettingsSetup?: () => void | Promise<void>,
  ): Promise<void> {
    await this.MainMenu.click();
    await this.#page.locator('#aiBackgroundCatalog').click();
    const providerIndex = Backgrounds.findIndex(b => b.settings.type === name);
    await this.#page.selectOption('#cbxBackgroundType', providerIndex.toString());
    if (providerSettingsSetup) {
      await providerSettingsSetup();
    }
    await this.#page.locator('.drawer-backdrop').click();
  }

  async addNewWidget(type: WidgetType) {
    await this.#page.locator('#btnMainMenu').click();
    await this.#page.locator('#aiWidgetsCatalog').click();
    const widgetLocatorByType = this.WidgetSection.getWidgetLocatorByType(type);
    const existingIds = await widgetLocatorByType.all().then(l => Promise.all(l.map(e => e.getAttribute('id'))));

    await this.#page.locator(`#wcipWidget_${type}`).click();

    let widgetLocators: Locator[] = [];
    do {
      widgetLocators = await widgetLocatorByType.all();
    } while (widgetLocators.length <= existingIds.length);

    let widgetLocator: Locator | null = null;
    for (const locator of widgetLocators) {
      const id = await locator.getAttribute('id');
      if (!existingIds.includes(id)) {
        widgetLocator = locator;
        break;
      }
    }

    if (widgetLocator === null) {
      throw new Error(`Failed to add widget of type ${type}`);
    }

    await widgetLocator.waitFor({ state: 'visible' });
    return widgetLocator;
  }

  async expectBackgroundImageToLoad(srcMatcher?: string | RegExp | any) {
    await this.BackgroundImage.waitFor({ state: 'visible' });
    if (srcMatcher !== null && srcMatcher !== undefined) {
      await expect(this.BackgroundImage).toHaveAttribute('src', srcMatcher);
    }
    await expect(this.BackgroundImage).toImageLoaded();
  }

  async reload(browserName: string) {
    this.#page.on('dialog', async dialog => {
      await this.#page.waitForTimeout(1000);
      await dialog.accept();
    });

    if (browserName === 'firefox') {
      await this.#page.waitForTimeout(10000);
    }

    await this.#page.reload();
    await this.#page.waitForLoadState('networkidle');
  }
}
