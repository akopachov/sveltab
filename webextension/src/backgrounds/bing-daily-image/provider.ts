import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { hoursToMilliseconds } from 'date-fns';

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Bing Daily Image', 'Provider'] });

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

export class BingDailyImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply() {
    super.apply();
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
      lastUrl: '',
    };

    const updateDeb = pDebounce.promise(() => this.#update());
    const localeUnsubscribe = this.settings.locale.subscribe(() => updateDeb());
    this.#unsubscribe = () => localeUnsubscribe();
    updateDeb();
  }

  forceUpdate(): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update();
  }

  async #update() {
    const hoursSinceLastChange = (Date.now() - this.#localSettings!.lastChangedTime) / hoursToMilliseconds(1);
    if (hoursSinceLastChange > 12 || this.settings.locale.value !== this.#localSettings!.lastLocale) {
      try {
        const response = await fetch(
          `https://bing.biturl.top/?resolution=${getClosestResolution()}&format=json&index=0&mkt=${
            this.settings.locale.value
          }&image_format=jpg`,
        ).then(r => r.json());
        this.#localSettings!.lastLocale = this.settings.locale.value;
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastUrl = response.url;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage(this.#localSettings!.lastUrl);
  }

  destroy(): void {
    super.destroy();
    this.#unsubscribe();
  }
}
