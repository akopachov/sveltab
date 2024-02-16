import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { PUBLIC_NASA_APOD_API_KEY } from '$env/static/public';
import { getImageCdnUrl } from '$lib/cdn';
import pDebounce from 'p-debounce';

const LocalSettingsKey = 'NasaApodBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'NASA APOD', 'Provider'] });

interface LocalSettings {
  lastUrl: string;
  lastChangedTime: number;
}

export class NasaApodBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply(abortSignal: AbortSignal) {
    super.apply(abortSignal);
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
      lastUrl: '',
    };

    const updateDeb = pDebounce(() => {
      this.#update(abortSignal);
    }, secondsToMilliseconds(1));
    const resizeObserver = new ResizeObserver(() => updateDeb());
    resizeObserver.observe(this.node);

    this.#unsubscribe = () => {
      resizeObserver.unobserve(this.node);
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
        this.#localSettings!.lastUrl = response.hdurl;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    if (abortSignal.aborted) {
      return;
    }
    this.setImage(getImageCdnUrl(this.#localSettings!.lastUrl, this.node.offsetWidth, this.node.offsetHeight));
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
