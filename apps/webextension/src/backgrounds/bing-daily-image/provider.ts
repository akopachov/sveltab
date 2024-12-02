import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { differenceInHours, secondsToMilliseconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import { BingMarkets, BingResolutions, getDailyWalpaper, type BingMarket } from './api';

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Bing Daily Image', 'Provider'] });

interface LocalSettings {
  lastLocale: string;
  lastChangedTime: number;
}

function getClosestResolution(nodeWidth: number, nodeHeight: number) {
  for (const res of BingResolutions) {
    if (res.width >= nodeWidth && res.height >= nodeHeight) {
      return res.resolution;
    }
  }

  return BingResolutions.at(-1)!.resolution;
}

function getClosestMarket(locale: BingMarket | 'random') {
  if (locale === 'random') {
    return BingMarkets[Math.floor(Math.random() * BingMarkets.length)];
  }

  return locale;
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
    let initialized = false;
    await super.apply(abortSignal);
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
    };

    const updateDeb = pDebounce.promise(() => this.#update(abortSignal));
    const update1SecDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));
    const forceUpdateDeb = pDebounce(() => this.forceUpdate(abortSignal), secondsToMilliseconds(1));
    const forceUpdateDebIfInitialized = () => {
      if (initialized) {
        forceUpdateDeb();
      }
    };
    const localeUnsubscribe = this.settings.locale.subscribe(forceUpdateDebIfInitialized);
    const screenResolutionUnsubscribe = observeScreenResolution(update1SecDeb);
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateDeb());

    this.#unsubscribe = () => {
      localeUnsubscribe();
      screenResolutionUnsubscribe();
      resizeTypeUnsubscribe();
    };
    initialized = true;
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
      (hoursSinceLastChange > 12 ||
        this.settings.locale.value !== this.#localSettings!.lastLocale ||
        !this.history.current)
    ) {
      try {
        const bingImageUrl = await getDailyWalpaper(
          getClosestResolution(
            window.screen.availWidth * window.devicePixelRatio,
            window.screen.availHeight * window.devicePixelRatio,
          ),
          getClosestMarket(this.settings.locale.value),
          abortSignal,
        );

        if (!bingImageUrl) {
          throw new Error('Unable to get Bing daily wallpaper');
        }
        this.#localSettings!.lastLocale = this.settings.locale.value;
        this.#localSettings!.lastChangedTime = Date.now();
        const newSrc = await getImageCdnUrl(bingImageUrl, 'screen', 'screen', this.settings.resizeType.value);
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
