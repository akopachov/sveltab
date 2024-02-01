import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns';

const LocalSettingsKey = 'RandomImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Random Image', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
  lastUrl: string;
  lastSearchTerm: string;
}

export class RandomImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply() {
    super.apply();
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        lastUrl: '',
      };
    }

    const interval = setInterval(() => {
      this.#update();
    }, minutesToMilliseconds(1));

    const updateDeb = pDebounce(() => this.#update(), secondsToMilliseconds(1));
    const searchTermUnsubsribe = this.settings.searchTerms.subscribe(() => updateDeb());

    this.#unsubscribe = () => {
      clearInterval(interval);
      searchTermUnsubsribe();
    };
    this.#update();
  }

  forceUpdate(): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update();
  }

  async #update() {
    const timeSinceLastChange = millisecondsToSeconds(Date.now() - this.#localSettings!.lastChangedTime);
    if (
      timeSinceLastChange >= this.settings.updateInterval.value ||
      this.#localSettings!.lastSearchTerm !== this.settings.searchTerms.value
    ) {
      try {
        const response = await fetch(
          `https://source.unsplash.com/random/${window.innerWidth}×${window.innerHeight}/?${encodeURIComponent(this.settings.searchTerms.value)}`,
          { method: 'head' },
        );
        this.#localSettings!.lastUrl = response.url;
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastSearchTerm = this.settings.searchTerms.value;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage(this.#localSettings!.lastUrl);
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
