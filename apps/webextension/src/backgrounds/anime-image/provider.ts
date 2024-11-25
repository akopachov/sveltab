import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import { AnimeTopics, getAnimeImageForTopic } from './api';

const LocalSettingsKey = 'AnimeImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Anime Image', 'Provider'] });
const availableTopics = Object.values(AnimeTopics);

interface LocalSettings {
  lastChangedTime: number;
  lastTopic: AnimeTopics | 'any';
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

    const topicUnsubsribe = this.settings.topic.subscribe(forceUpdateDebIfInitialized);
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateDeb());

    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);

    this.#unsubscribe = () => {
      clearInterval(interval);
      topicUnsubsribe();
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
    if (
      navigator.onLine &&
      (timeSinceLastChange >= this.settings.updateInterval.value ||
        this.#localSettings!.lastTopic !== this.settings.topic.value)
    ) {
      try {
        const topic =
          this.settings.topic.value === 'any'
            ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
            : this.settings.topic.value;
        const responseImageUrl = await getAnimeImageForTopic(topic, abortSignal);
        if (!responseImageUrl) {
          throw new Error('Unexpected response');
        }

        const newSrc = await getImageCdnUrl(responseImageUrl, 'screen', 'screen', this.settings.resizeType.value);
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastTopic = this.settings.topic.value;
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

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
