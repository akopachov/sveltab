import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns';
import { PUBLIC_PEXELS_API_KEY } from '$env/static/public';

const LocalSettingsKey = 'PexelsBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Pexels', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
  lastSrc: string | undefined | null;
  lastSearchTerm: string;
  pool: string[];
  currentPage: number;
  totalPages: number;
}

function pickBetterUrl(src: string | undefined | null) {
  if (!src) return '';
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;

  return `${src}?fit=crop&h=${height}&w=${width}`;
}

export class PexelsBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  async apply(abortSignal: AbortSignal) {
    super.apply(abortSignal);
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        pool: [],
      };
    }

    const interval = setInterval(() => {
      this.#update(abortSignal);
    }, minutesToMilliseconds(1));

    const updateDeb = pDebounce(() => {
      this.#update(abortSignal);
    }, secondsToMilliseconds(1));
    const searchTermUnsubsribe = this.settings.searchTerms.subscribe(() => updateDeb());

    const resizeObserver = new ResizeObserver(() => updateDeb());
    resizeObserver.observe(this.node);

    this.#unsubscribe = () => {
      clearInterval(interval);
      searchTermUnsubsribe();
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
    let timeSinceLastChange = millisecondsToSeconds(Date.now() - this.#localSettings!.lastChangedTime);
    if (this.#localSettings!.lastSearchTerm !== this.settings.searchTerms.value) {
      this.#localSettings!.pool = [];
      this.#localSettings!.currentPage = 0;
      this.#localSettings!.totalPages = 0;
      timeSinceLastChange = Number.MAX_SAFE_INTEGER;
    }

    if (timeSinceLastChange >= this.settings.updateInterval.value) {
      try {
        if (this.#localSettings!.pool.length <= 0) {
          if (this.#localSettings!.currentPage < this.#localSettings!.totalPages) {
            this.#localSettings!.currentPage++;
          } else {
            this.#localSettings!.currentPage = 1;
          }

          const requestUri = this.settings.searchTerms.value
            ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.settings.searchTerms.value)}&`
            : 'https://api.pexels.com/v1/curated?';

          const response = await fetch(`${requestUri}per_page=50&page=${this.#localSettings!.currentPage}`, {
            headers: {
              Authorization: PUBLIC_PEXELS_API_KEY,
            },
            signal: abortSignal,
          }).then(r => r.json());
          if (!Array.isArray(response?.photos)) {
            throw new Error('Unexpected response');
          }

          this.#localSettings!.pool = response.photos.map((m: any) => m.src.original);
          this.#localSettings!.totalPages = Math.ceil(response.total_results / response.per_page);
        }

        const randomIndex = Math.floor(Math.random() * this.#localSettings!.pool.length);
        this.#localSettings!.lastSrc = this.#localSettings!.pool.splice(randomIndex, 1)[0];
        this.#localSettings!.lastChangedTime = Date.now();
        this.#localSettings!.lastSearchTerm = this.settings.searchTerms.value;
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });
      } catch (e) {
        log.warn(e);
      }
    }
    if (abortSignal.aborted) {
      return;
    }
    this.setImage(pickBetterUrl(this.#localSettings!.lastSrc));
  }

  destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}
