import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { differenceInHours, formatISO, secondsToMilliseconds, subDays } from 'date-fns';
import { PUBLIC_NASA_APOD_API_KEY } from '$env/static/public';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import pDebounce from 'p-debounce';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import { skipFirstRun } from '$lib/function-utils';

const LocalSettingsKey = 'NasaApodBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'NASA APOD', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
}

export class NasaApodBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  constructor(node: HTMLElement, settings: Settings) {
    super(node, settings, 'nasa-apod');
  }

  get canGoNext() {
    return false;
  }

  async apply(abortSignal: AbortSignal) {
    await super.apply(abortSignal);
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
    };

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));
    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(skipFirstRun(updateDeb));

    this.#unsubscribe = () => {
      screenResolutionUnsubscribe();
      resizeTypeUnsubscribe();
    };

    await this.#update(abortSignal);
  }

  forceUpdate(abortSignal: AbortSignal): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update(abortSignal);
  }

  readonly #update = pDebounce.promise(async (abortSignal: AbortSignal) => {
    if (abortSignal.aborted) {
      return;
    }

    this.setImage(updateImageCdnUrl(this.history.current, 'screen', 'screen', this.settings.resizeType.value));
    const hoursSinceLastChange = differenceInHours(Date.now(), this.#localSettings!.lastChangedTime);
    if (navigator.onLine && (hoursSinceLastChange > 12 || !this.history.current)) {
      try {
        let response: any;
        let triesCount = 0;
        do {
          const targetDateAsISO = formatISO(subDays(Date.now(), triesCount), { representation: 'date' });
          response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${PUBLIC_NASA_APOD_API_KEY}&date=${targetDateAsISO}`,
            {
              signal: abortSignal,
            },
          ).then(r => r.json());
          triesCount++;
        } while (
          typeof response === 'object' &&
          typeof response.media_type === 'string' &&
          response.media_type !== 'image' &&
          triesCount < 10
        );

        if (!response?.hdurl) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastChangedTime = Date.now();
        const newSrc = await getImageCdnUrl(response.hdurl, 'screen', 'screen', this.settings.resizeType.value);
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });

        if (abortSignal.aborted) {
          return;
        }
        this.setImage(updateImageCdnUrl(newSrc, 'screen', 'screen', this.settings.resizeType.value), true);
      } catch (e) {
        log.warn(e);
      }
    }
  });

  async destroy() {
    await super.destroy();
    this.#unsubscribe();
  }
}
