import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { minutesToMilliseconds } from 'date-fns';
import { millisecondsToSeconds } from 'date-fns';

const LocalSettingsKey = 'RandomImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({prefix: ['Backgropunds', 'Random Image', 'Provider']});

interface LocalSettings {
  lastChangedTime: number;
  lastUrl: string;
  lastSearchTerm: string;
}

export class RandomImageBackgroundProvider extends ImageBackgroundProviderBase {
  #interval: any;
  #lastSettings: Settings | undefined;
  #localSettings: LocalSettings | undefined;
  constructor(node: HTMLElement) {
    super(node);
    this.#interval = setInterval(() => {
      if (this.#lastSettings) {
        this.update(this.#lastSettings);
      }
    }, minutesToMilliseconds(1));
  }

  async update(settings: Settings, forceUpdate?: boolean) {
    this.#lastSettings = settings;
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        lastUrl: '',
      };
    }
    const timeSinceLastChange = millisecondsToSeconds(new Date().valueOf() - this.#localSettings!.lastChangedTime);
    if (
      timeSinceLastChange >= settings.updateInterval ||
      this.#localSettings!.lastSearchTerm !== settings.searchTerms ||
      forceUpdate === true
    ) {
      try {
        const response = await fetch(
          `https://source.unsplash.com/random/${window.innerWidth}×${window.innerHeight}/?${settings.searchTerms}`,
          { method: 'head' },
        );
        this.#localSettings!.lastUrl = response.url;
        this.#localSettings!.lastChangedTime = new Date().valueOf();
        this.#localSettings!.lastSearchTerm = settings.searchTerms;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage({ url: this.#localSettings!.lastUrl, blur: settings.blur, filter: settings.filter });
  }

  destroy() {
    super.destroy();
    clearInterval(this.#interval);
  }
}
