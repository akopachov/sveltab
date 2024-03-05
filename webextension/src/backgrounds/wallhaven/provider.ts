import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns';
import { getImageCdnUrl } from '$lib/cdn';
import { getCorsFriendlyUrl } from '$lib/cors-bypass';

const LocalSettingsKey = 'WallhavenBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Wallhaven', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
  lastSrc: string | undefined | null;
  pool: string[];
  currentPage: number;
  totalPages: number;
  seed: string;
}

export class WallhavenBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply(abortSignal: AbortSignal) {
    let initialized = false;
    super.apply(abortSignal);
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        pool: [],
      };
    }

    const forceRefresh = () => {
      this.#localSettings!.pool = [];
      this.#localSettings!.currentPage = 0;
      this.#localSettings!.totalPages = 0;
      this.#localSettings!.lastChangedTime = 0;
      this.#localSettings!.seed = '';
    };

    const interval = setInterval(() => {
      this.#update(abortSignal);
    }, minutesToMilliseconds(1));

    const updateDeb = pDebounce(() => {
      this.#update(abortSignal);
    }, secondsToMilliseconds(1));

    const updateDebWithRefresh = () => {
      if (initialized) {
        forceRefresh();
        updateDeb();
      }
    };

    const searchTermUnsubsribe = this.settings.searchTerms.subscribe(updateDebWithRefresh);
    const purityUnsubsribe = this.settings.purity.subscribe(updateDebWithRefresh);
    const apiKeyUnsubsribe = this.settings.apiKey.subscribe(updateDebWithRefresh);
    const colorsUnsubsribe = this.settings.colors.subscribe(updateDebWithRefresh);

    const resizeObserver = new ResizeObserver(() => updateDeb());
    resizeObserver.observe(this.node);

    this.#unsubscribe = () => {
      clearInterval(interval);
      searchTermUnsubsribe();
      purityUnsubsribe();
      apiKeyUnsubsribe();
      colorsUnsubsribe();
      resizeObserver.unobserve(this.node);
    };
    initialized = true;
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
    if (timeSinceLastChange >= this.settings.updateInterval.value) {
      try {
        if (this.#localSettings!.pool.length <= 0) {
          if (this.#localSettings!.currentPage < this.#localSettings!.totalPages) {
            this.#localSettings!.currentPage++;
          } else {
            this.#localSettings!.currentPage = 1;
            this.#localSettings!.seed = '';
          }

          const requestUri = new URL(
            `https://wallhaven.cc/api/v1/search?page=${this.#localSettings!.currentPage}&sorting=random`,
          );
          if (this.settings.searchTerms.value) {
            requestUri.searchParams.set('q', this.settings.searchTerms.value);
          }

          if (this.settings.apiKey.value) {
            requestUri.searchParams.set('apikey', this.settings.apiKey.value);
          }

          if (this.settings.purity.value) {
            requestUri.searchParams.set('purity', this.settings.purity.value);
          }

          if (this.settings.colors.value?.length > 0) {
            requestUri.searchParams.set('colors', this.settings.colors.value.join(','));
          }

          if (this.#localSettings!.seed) {
            requestUri.searchParams.set('seed', this.#localSettings!.seed);
          }

          const response = await fetch(getCorsFriendlyUrl(requestUri.toString()), {
            signal: abortSignal,
          }).then(r => r.json());
          if (!Array.isArray(response?.data)) {
            throw new Error('Unexpected response');
          }

          this.#localSettings!.pool = response.data.map((m: any) => m.path);
          this.#localSettings!.totalPages = response.meta.last_page;
          this.#localSettings!.seed = response.meta.seed;
        }

        const randomIndex = Math.floor(Math.random() * this.#localSettings!.pool.length);
        this.#localSettings!.lastSrc = this.#localSettings!.pool.splice(randomIndex, 1)[0];
        this.#localSettings!.lastChangedTime = Date.now();
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    if (abortSignal.aborted) {
      return;
    }
    this.setImage(getImageCdnUrl(this.#localSettings!.lastSrc, 'document', 'document'));
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
