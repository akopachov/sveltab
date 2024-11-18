import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { differenceInHours, secondsToMilliseconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import type { BingSupportedMarkets } from './types';
import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';

const LocalSettingsKey = 'BingDailyImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Bing Daily Image', 'Provider'] });

interface LocalSettings {
  lastLocale: string;
  lastChangedTime: number;
}

type BingApiResponse = { images: { urlbase: string }[] };

const BingAvailableMarkets: BingSupportedMarkets[] = [
  'en-US',
  'zh-CN',
  'ja-JP',
  'en-AU',
  'en-GB',
  'de-DE',
  'en-NZ',
  'en-CA',
  'en-IN',
  'fr-FR',
  'fr-CA',
];

const BingResolutionMap = [
  { width: 240, height: 320, resolution: '240x320' },
  { width: 320, height: 240, resolution: '320x240' },
  { width: 400, height: 240, resolution: '400x240' },
  { width: 480, height: 800, resolution: '480x800' },
  { width: 640, height: 480, resolution: '640x480' },
  { width: 720, height: 1280, resolution: '720x1280' },
  { width: 768, height: 1280, resolution: '768x1280' },
  { width: 800, height: 480, resolution: '800x480' },
  { width: 800, height: 600, resolution: '800x600' },
  { width: 1024, height: 768, resolution: '1024x768' },
  { width: 1280, height: 768, resolution: '1280x768' },
  { width: 1366, height: 768, resolution: '1366x768' },
  { width: 1920, height: 1080, resolution: '1920x1080' },
  { width: 1920, height: 1200, resolution: '1920x1200' },
  { width: 3840, height: 2160, resolution: 'UHD' },
];

function getClosestResolution(nodeWidth: number, nodeHeight: number) {
  for (const res of BingResolutionMap) {
    if (res.width >= nodeWidth && res.height >= nodeHeight) {
      return res.resolution;
    }
  }

  return BingResolutionMap.at(-1)!.resolution;
}

function getClosestMarket(locale: BingSupportedMarkets | 'random') {
  if (locale === 'random') {
    return BingAvailableMarkets[Math.floor(Math.random() * BingAvailableMarkets.length)];
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
          getCorsFriendlyUrl(
            `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${getClosestMarket(this.settings.locale.value)}`,
          ),
          {
            signal: abortSignal,
          },
        ).then<BingApiResponse>(r => r.json());
        if (!response?.images || response.images.length <= 0) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastLocale = this.settings.locale.value;
        this.#localSettings!.lastChangedTime = Date.now();
        const bingImageUrl = `https://bing.com${response.images[0].urlbase}_${getClosestResolution(this.node.offsetWidth, this.node.offsetHeight)}.jpg`;
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

  destroy(): void {
    super.destroy();
    this.#unsubscribe();
  }
}
