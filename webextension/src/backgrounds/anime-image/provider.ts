import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import { AnimeTopics, type Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns';
import { getImageCdnUrl } from '$lib/cdn';

const LocalSettingsKey = 'AnimeImageBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Anime Image', 'Provider'] });
const availableTopics = Object.values(AnimeTopics).filter(f => f !== AnimeTopics.Any);

interface LocalSettings {
  lastChangedTime: number;
  lastUrl: string;
  lastTopic: AnimeTopics;
}

export class AnimeImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply(abortSignal: AbortSignal) {
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

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));
    const topicUnsubsribe = this.settings.topic.subscribe(() => updateDeb());

    const resizeObserver = new ResizeObserver(() => updateDeb());
    resizeObserver.observe(this.node);

    this.#unsubscribe = () => {
      clearInterval(interval);
      topicUnsubsribe();
      resizeObserver.unobserve(this.node);
    };
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
    const timeSinceLastChange = millisecondsToSeconds(Date.now() - this.#localSettings!.lastChangedTime);
    if (
      timeSinceLastChange >= this.settings.updateInterval.value ||
      this.#localSettings!.lastTopic !== this.settings.topic.value
    ) {
      try {
        const topic =
          this.settings.topic.value === AnimeTopics.Any
            ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
            : this.settings.topic.value;
        const response = await fetch(`https://t.mwm.moe/${topic}/?json`, { signal: abortSignal }).then(r => r.json());
        if (!response?.url) {
          throw new Error('Unexpected response');
        }
        this.#localSettings!.lastUrl = response.url;
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastTopic = this.settings.topic.value;
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
