import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { hoursToMilliseconds } from 'date-fns';

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgropunds', 'Bing Daily Image', 'Provider'] });

interface LocalSettings {
  lastUrl: string;
  lastLocale: string;
  lastChangedTime: number;
}

function getClosestResolution() {
  const w = window.screen.availWidth;
  if (w > 1920) return 3840;
  if (w > 1366) return 1920;
  return 1366;
}

export class BingDailyImageBackgroundProvider extends ImageBackgroundProviderBase {
  #localSettings: LocalSettings | undefined;

  async update(settings: Settings) {
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        lastUrl: '',
      };
    }
    const hoursSinceLastChange = (new Date().valueOf() - this.#localSettings!.lastChangedTime) / hoursToMilliseconds(1);
    if (hoursSinceLastChange > 12 || settings.locale !== this.#localSettings!.lastLocale) {
      try {
        const response = await fetch(
          `https://bing.biturl.top/?resolution=${getClosestResolution()}&format=json&index=0&mkt=${
            settings.locale
          }&image_format=jpg`,
        ).then(r => r.json());
        this.#localSettings!.lastLocale = settings.locale;
        this.#localSettings!.lastChangedTime = new Date().valueOf();
        this.#localSettings!.lastUrl = response.url;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage({ url: this.#localSettings!.lastUrl, blur: settings.blur, filter: settings.filter });
  }
}
