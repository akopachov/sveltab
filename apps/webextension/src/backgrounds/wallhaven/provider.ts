import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds } from 'date-fns';
import { getImageCdnUrl, updateImageCdnUrl } from '$lib/cdn';
import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import { observeScreenResolution } from '$lib/screen-resolution-observer';

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

  get canGoNext() {
    return true;
  }

  async apply(abortSignal: AbortSignal) {
    let initialized = false;
    await super.apply(abortSignal);
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

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));

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
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateDeb());

    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);

    this.#unsubscribe = () => {
      clearInterval(interval);
      screenResolutionUnsubscribe();
      searchTermUnsubsribe();
      purityUnsubsribe();
      apiKeyUnsubsribe();
      colorsUnsubsribe();
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

    this.setImage(updateImageCdnUrl(this.#localSettings!.lastSrc, 'screen', 'screen', this.settings.resizeType.value));

    const timeSinceLastChange = differenceInSeconds(Date.now(), this.#localSettings!.lastChangedTime);
    if (navigator.onLine && timeSinceLastChange >= this.settings.updateInterval.value) {
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
        this.#localSettings!.lastSrc = await getImageCdnUrl(
          this.#localSettings!.pool.splice(randomIndex, 1)[0],
          'screen',
          'screen',
          this.settings.resizeType.value,
        );
        this.#localSettings!.lastChangedTime = Date.now();
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
        if (abortSignal.aborted) {
          return;
        }

        this.setImage(
          updateImageCdnUrl(this.#localSettings!.lastSrc, 'screen', 'screen', this.settings.resizeType.value),
        );
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
