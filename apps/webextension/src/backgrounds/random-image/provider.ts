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
}

export class RandomImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  get canGoNext() {
    return true;
  }

  async apply(abortSignal: AbortSignal) {
    let initialized = false;
    super.apply(abortSignal);
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        lastUrl: '',
      };
    }

    const interval = setInterval(() => {
      this.#update(abortSignal);
    }, minutesToMilliseconds(1));

    const forceRefresh = () => {
      this.#localSettings!.lastChangedTime = 0;
    };

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));

    const updateDebWithRefresh = () => {
      if (initialized) {
        forceRefresh();
        updateDeb();
      }
    };

    const searchTermUnsubsribe = this.settings.searchTerms.subscribe(updateDebWithRefresh);

    this.#unsubscribe = () => {
      clearInterval(interval);
      searchTermUnsubsribe();
    };
    initialized = true;
    this.#update(abortSignal);
  }

  forceUpdate(abortSignal: AbortSignal): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update(abortSignal);
  }

  async #update(abortSignal: AbortSignal) {
    if (abortSignal.aborted) {
      return;
    }

    this.setImage(this.#localSettings!.lastUrl);
    const timeSinceLastChange = millisecondsToSeconds(Date.now() - this.#localSettings!.lastChangedTime);
    if (timeSinceLastChange >= this.settings.updateInterval.value) {
      try {
        const response = await fetch(
          `https://source.unsplash.com/random/${window.innerWidth}×${window.innerHeight}/?${encodeURIComponent(this.settings.searchTerms.value)}`,
          { method: 'head', signal: abortSignal },
        );
        this.#localSettings!.lastUrl = response.url;
        this.#localSettings!.lastChangedTime = Date.now();
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });

        if (abortSignal.aborted) {
          return;
        }
        this.setImage(this.#localSettings!.lastUrl);
      } catch (e) {
        log.warn(e);
      }
    }
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
