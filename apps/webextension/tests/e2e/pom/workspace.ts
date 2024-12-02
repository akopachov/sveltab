import { Backgrounds } from '$backgrounds';
import { type Page, type Locator, expect } from '@playwright/test';

export type BackgroundProviderName = (typeof Backgrounds)[number]['settings']['type'];

export class WorkspacePage {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.MainMenu = page.locator('#btnMainMenu');
    this.BackgroundImage = page.locator('#imgBackground[src]');
    this.PreviousBackgroundButton = page.locator('#btnPreviousBackground');
    this.MextBackgroundButton = page.locator('#btnNextBackground');
  }

  readonly MainMenu: Locator;
  readonly BackgroundImage: Locator;
  readonly PreviousBackgroundButton: Locator;
  readonly MextBackgroundButton: Locator;

  async selectBackgroundProvider(name: BackgroundProviderName): Promise<void> {
    await this.MainMenu.click();
    await this.#page.locator('#aiBackgroundCatalog').click();
    const providerIndex = Backgrounds.findIndex(b => b.settings.type === name);
    await this.#page.selectOption('#cbxBackgroundType', providerIndex.toString());
    await this.#page.locator('.drawer-backdrop').click();
  }

  async expectBackgroundImageToLoad(srcMatcher: string | RegExp | any | null | undefined) {
    await this.BackgroundImage.waitFor({ state: 'visible' });
    if (srcMatcher !== null && srcMatcher !== undefined) {
      await expect(this.BackgroundImage).toHaveAttribute('src', srcMatcher);
    }
    await expect(this.BackgroundImage).toHaveJSProperty('complete', true);
    await expect(this.BackgroundImage).not.toHaveJSProperty('naturalWidth', 0);
  }

  async reload(browserName: string) {
    this.#page.on('dialog', async dialog => {
      await this.#page.waitForTimeout(500);
      await dialog.accept();
    });

    if (browserName === 'firefox') {
      await this.#page.waitForTimeout(10000);
    }

    await this.#page.reload();
    await this.#page.waitForLoadState('networkidle');
  }
}
