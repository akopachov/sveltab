import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { differenceInHours, secondsToMilliseconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Bing Daily Image', 'Provider'] });

interface LocalSettings {
  lastLocale: string;
  lastChangedTime: number;
}

function getClosestResolution(nodeWidth: number) {
  if (nodeWidth > 1920) return 3840;
  if (nodeWidth > 1366) return 1920;
  return 1366;
}

export class BingDailyImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  constructor(node: HTMLElement, settings: Settings) {
    super(node, settings, 'bing-daily-image');
  }

  get canGoNext() {
    return false;
  }

  async apply(abortSignal: AbortSignal) {
    await super.apply(abortSignal);
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
      lastUrl: '',
    };

    const updateDeb = pDebounce.promise(() => this.#update(abortSignal));
    const update1SecDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));
    const localeUnsubscribe = this.settings.locale.subscribe(() => updateDeb());
    const screenResolutionUnsubscribe = observeScreenResolution(update1SecDeb);
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateDeb());

    this.#unsubscribe = () => {
      localeUnsubscribe();
      screenResolutionUnsubscribe();
      resizeTypeUnsubscribe();
    };
    updateDeb();
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
    if (
      navigator.onLine &&
      (hoursSinceLastChange > 12 || this.settings.locale.value !== this.#localSettings!.lastLocale)
    ) {
      try {
        const response = await fetch(
          `https://bing.biturl.top/?resolution=${getClosestResolution(this.node.offsetWidth)}&format=json&index=0&mkt=${
            this.settings.locale.value
          }&image_format=jpg`,
          {
            signal: abortSignal,
          },
        ).then(r => r.json());
        if (!response?.url) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastLocale = this.settings.locale.value;
        this.#localSettings!.lastChangedTime = Date.now();
        const newSrc = await getImageCdnUrl(response.url, 'screen', 'screen', this.settings.resizeType.value);
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

  destroy(): void {
    super.destroy();
    this.#unsubscribe();
  }
}
