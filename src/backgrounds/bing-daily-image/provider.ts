import { ImageBackgroundProviderBase } from "$backgrounds/common-image/provider-base";
import { getStorage } from "$stores/storage";
import type { Settings } from "./settings";

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';

interface LocalSettings {
  lastUrl: string;
  lastLocale: string;
  lastChangedTime: number;
}

export class BingDailyImageBackgroundProvider extends ImageBackgroundProviderBase {
  #localSettings: LocalSettings | undefined;

  async update(settings: Settings) {
    if (!this.#localSettings) {
      const storage = await getStorage();
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || { lastChangedTime: 0, lastUrl: '' };
    }
    const hoursSinceLastChange = (new Date().valueOf() - this.#localSettings!.lastChangedTime) / 3600000;
    if (hoursSinceLastChange > 12 || settings.locale !== this.#localSettings!.lastLocale) {
      try {
        const response = await fetch(`https://peapix.com/bing/feed?country=${settings.locale}`).then(r => r.json());
        this.#localSettings!.lastLocale = settings.locale;
        this.#localSettings!.lastChangedTime = new Date().valueOf();
        this.#localSettings!.lastUrl = response[0].fullUrl;
        const storage = await getStorage();
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        console.warn(this, '->', e);
      }
    }
    this.setImage({url: this.#localSettings!.lastUrl, blur: settings.blur});
  }
  destroy(): void {
    super.destroy();
  }
}
