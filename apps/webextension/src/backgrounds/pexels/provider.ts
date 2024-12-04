import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import { logger } from '$lib/logger';
import { storage } from '$stores/storage';
import pDebounce from 'p-debounce';
import type { Settings } from './settings';
import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds } from 'date-fns';
import { PUBLIC_PEXELS_API_KEY } from '$env/static/public';
import { ImageResizeType } from '$lib/cdn';
import { observeScreenResolution } from '$lib/screen-resolution-observer';
import { getClockStore } from '$stores/clock-store';
import { skipFirstRun } from '$lib/function-utils';

const LocalSettingsKey = 'PexelsBackgroundProvider_LocalSettings';
const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Pexels', 'Provider'] });

interface LocalSettings {
  lastChangedTime: number;
  pool: string[];
  currentPage: number;
  totalPages: number;
}

function pickBetterUrl(src: string | undefined | null, node: HTMLElement, resizeType: ImageResizeType) {
  if (!src) return '';
  const width = node.clientWidth;
  const height = node.clientHeight;
  let resizeTypeArgValue: string;
  switch (resizeType) {
    case ImageResizeType.Contain:
      resizeTypeArgValue = 'contain';
      break;
    case ImageResizeType.Cover:
      resizeTypeArgValue = 'crop';
      break;
    default:
      resizeTypeArgValue = 'crop';
      break;
  }

  if (src.includes('?') && URL.canParse(src)) {
    const srcUrl = new URL(src);
    srcUrl.searchParams.set('fit', resizeTypeArgValue);
    srcUrl.searchParams.set('h', height.toString());
    srcUrl.searchParams.set('w', width.toString());
    return srcUrl.toString();
  }

  return `${src}?fit=${resizeTypeArgValue}&h=${height}&w=${width}`;
}

export class PexelsBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #localSettings: LocalSettings | undefined;
  #unsubscribe!: () => void;

  constructor(node: HTMLElement, settings: Settings) {
    super(node, settings, 'pexels');
  }

  get canGoNext() {
    return true;
  }

  async apply(abortSignal: AbortSignal) {
    await super.apply(abortSignal);
    if (!this.#localSettings) {
      this.#localSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || {
        lastChangedTime: 0,
        pool: [],
      };
    }

    const updateDeb = pDebounce(() => this.#update(abortSignal), secondsToMilliseconds(1));

    const forceUpdateDebWithRefresh = () => {
      this.#localSettings!.pool = [];
      this.#localSettings!.currentPage = 0;
      this.#localSettings!.totalPages = 0;
      this.#localSettings!.lastChangedTime = 0;
      updateDeb();
    };

    const searchTermUnsubsribe = this.settings.searchTerms.subscribe(skipFirstRun(forceUpdateDebWithRefresh));
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(skipFirstRun(updateDeb));
    const clockStoreUnsubscribe = getClockStore(minutesToMilliseconds(1)).subscribe(
      skipFirstRun(() => this.#update(abortSignal)),
    );
    const screenResolutionUnsubscribe = observeScreenResolution(updateDeb);

    this.#unsubscribe = () => {
      searchTermUnsubsribe();
      resizeTypeUnsubscribe();
      screenResolutionUnsubscribe();
      clockStoreUnsubscribe();
    };
    await this.#update(abortSignal);
  }

  forceUpdate(abortSignal: AbortSignal): void {
    this.#localSettings!.lastChangedTime = 0;
    this.#update(abortSignal);
  }

  readonly #update = pDebounce.promise(async (abortSignal: AbortSignal) => {
    if (abortSignal.aborted) {
      return;
    }

    this.setImage(pickBetterUrl(this.history.current, this.node, this.settings.resizeType.value));
    const timeSinceLastChange = differenceInSeconds(Date.now(), this.#localSettings!.lastChangedTime);
    if (navigator.onLine && (timeSinceLastChange >= this.settings.updateInterval.value || !this.history.current)) {
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
        const newSrc = this.#localSettings!.pool.splice(randomIndex, 1)[0];
        this.#localSettings!.lastChangedTime = Date.now();
        await storage.local.set({ [LocalSettingsKey]: this.#localSettings });

        if (abortSignal.aborted) {
          return;
        }
        this.setImage(pickBetterUrl(newSrc, this.node, this.settings.resizeType.value), true);
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
