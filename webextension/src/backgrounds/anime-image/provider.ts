import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import { AnimeTopics, type Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns';

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

  async apply() {
    super.apply();
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        lastUrl: '',
      };
    }

    const interval = setInterval(() => {
      this.#update();
    }, minutesToMilliseconds(1));

    const updateDeb = pDebounce(() => this.#update(), secondsToMilliseconds(1));
    const topicUnsubsribe = this.settings.topic.subscribe(() => updateDeb());

    this.#unsubscribe = () => {
      clearInterval(interval);
      topicUnsubsribe();
    };
    this.#update();
  }

  forceUpdate(): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update();
  }

  async #update() {
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
        const response = await fetch(`https://t.mwm.moe/${topic}/?json`).then(r => r.json());
        this.#localSettings!.lastUrl = response.url;
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastTopic = this.settings.topic.value;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage(this.#localSettings!.lastUrl);
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
