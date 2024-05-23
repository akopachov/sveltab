import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { isToday, secondsToMilliseconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import pDebounce from 'p-debounce';
import { observeScreenResolution } from '$lib/screen-resolution-observer';

const LocalSettingsKey = 'WikimediaCommonsPodBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Wikimedia Commons POD', 'Provider'] });

interface LocalSettings {
  lastUrl: string | undefined | null;
  lastChangedTime: number;
}

export class WikimediaCommonsPodBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
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
    if (navigator.onLine && !isToday(this.#localSettings!.lastChangedTime)) {
      try {
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const response = await fetch(
          `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`,
          { signal: abortSignal },
        ).then(r => r.json());
        if (!response?.image?.image?.source) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastChangedTime = now.valueOf();
        this.#localSettings!.lastUrl = await getImageCdnUrl(response.image.image.source, 'screen', 'screen');
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
