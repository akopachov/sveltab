import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { PUBLIC_NASA_APOD_API_KEY } from '$env/static/public';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import pDebounce from 'p-debounce';
import { observeScreenResolution } from '$lib/screen-resolution-observer';

const LocalSettingsKey = 'NasaApodBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'NASA APOD', 'Provider'] });

interface LocalSettings {
  lastUrl: string | null | undefined;
  lastChangedTime: number;
}

export class NasaApodBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  get canGoNext() {
    return false;
  }

  async apply(abortSignal: AbortSignal) {
    super.apply(abortSignal);
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
      lastUrl: '',
    };

    const updateDeb = pDebounce(() => {
      this.#update(abortSignal);
    }, secondsToMilliseconds(1));
    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);

    this.#unsubscribe = () => {
      screenResolutionUnsubscribe();
    };

    await this.#update(abortSignal);
  }

  forceUpdate(abortSignal: AbortSignal): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update(abortSignal);
  }

  async #update(abortSignal: AbortSignal) {
    if (abortSignal.aborted) {
      return;
    }

    this.setImage(updateImageCdnUrl(this.#localSettings!.lastUrl, 'screen', 'screen'));
    const hoursSinceLastChange = (Date.now() - this.#localSettings!.lastChangedTime) / hoursToMilliseconds(1);
    if (hoursSinceLastChange > 12) {
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${PUBLIC_NASA_APOD_API_KEY}`, {
          signal: abortSignal,
        }).then(r => r.json());
        if (!response?.hdurl) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastUrl = await getImageCdnUrl(response.hdurl, 'screen', 'screen');
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });

        if (abortSignal.aborted) {
          return;
        }
        this.setImage(updateImageCdnUrl(this.#localSettings!.lastUrl, 'screen', 'screen'));
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
