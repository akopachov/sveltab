import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import { getAnimeImage } from './api';

const LocalSettingsKey = 'AnimeImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Anime Image', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
}

export class AnimeImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  constructor(node: HTMLElement, settings: Settings) {
    super(node, settings, 'anime-image');
  }

  get canGoNext() {
    return true;
  }

  async apply(abortSignal: AbortSignal) {
    let initialized = false;
    await super.apply(abortSignal);
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
      };
    }

    const interval = setInterval(() => {
      this.#update(abortSignal);
    }, minutesToMilliseconds(1));

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));
    const forceUpdateDeb = pDebounce(() => this.forceUpdate(abortSignal), secondsToMilliseconds(1));
    const forceUpdateDebIfInitialized = () => {
      if (initialized) {
        forceUpdateDeb();
      }
    };

    const includeTagsUnsubsribe = this.settings.includeTags.subscribe(forceUpdateDebIfInitialized);
    const excludeTagsUnsubsribe = this.settings.excludeTags.subscribe(forceUpdateDebIfInitialized);
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateDeb());

    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);

    this.#unsubscribe = () => {
      clearInterval(interval);
      includeTagsUnsubsribe();
      excludeTagsUnsubsribe();
      screenResolutionUnsubscribe();
      resizeTypeUnsubscribe();
    };
    initialized = true;
    this.#update(abortSignal);
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
    const timeSinceLastChange = differenceInSeconds(Date.now(), this.#localSettings!.lastChangedTime);
    if (navigator.onLine && (timeSinceLastChange >= this.settings.updateInterval.value || !this.history.current)) {
      try {
        const responseImageUrl = await getAnimeImage({
          includeTags: this.settings.includeTags.value,
          excludeTags: this.settings.excludeTags.value,
          abortSignal,
        });
        if (!responseImageUrl?.file_url) {
          throw new Error('Unexpected response');
        }

        const newSrc = await getImageCdnUrl(
          responseImageUrl.file_url,
          'screen',
          'screen',
          this.settings.resizeType.value,
        );
        this.#localSettings!.lastChangedTime = Date.now();
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
