import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import type { Settings } from './settings';
import { hoursToMilliseconds } from 'date-fns';
import { PUBLIC_NASA_APOD_API_KEY } from '$env/static/public';
import { getImageCdnUrl } from '$lib/cdn';

const LocalSettingsKey = 'NasaApodBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'NASA APOD', 'Provider'] });

interface LocalSettings {
  lastUrl: string;
  lastChangedTime: number;
}

export class NasaApodBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;

  async apply() {
    super.apply();
    this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
      lastChangedTime: 0,
      lastUrl: '',
    };

    await this.#update();
  }

  forceUpdate(): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update();
  }

  async #update() {
    const hoursSinceLastChange = (Date.now() - this.#localSettings!.lastChangedTime) / hoursToMilliseconds(1);
    if (hoursSinceLastChange > 12) {
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${PUBLIC_NASA_APOD_API_KEY}`).then(
          r => r.json(),
        );
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastUrl = response.hdurl;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    this.setImage(getImageCdnUrl(this.#localSettings!.lastUrl));
  }
}
