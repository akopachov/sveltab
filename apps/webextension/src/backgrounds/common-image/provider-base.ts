import { ImageResizeType } from '$lib/cdn';
import { BackgroundProvider } from '../types';
import { ResourcesToPreload } from '$stores/preload-resources';
import debounce from 'debounce';
import type { ImageBackgroundProviderSettingsBase } from './settings-base';
import { FastAverageColorEx } from './fast-average-color-ex';
import type { BackgroundCornerColorChangedEventArgs } from '$actions/dynamic-background';
import { Opfs, OpfsSchema } from '$lib/opfs';
import { Lazy } from '$lib/lazy';
import { storage } from '$stores/storage';
import { ImageBackgroundHistory } from './history';

const IMAGE_BACKGROUND_PROVIDER_SHARED_META_KEY = 'imageBackgroundProviderSharedMeta';

const BaseNodeClassList = [
  'top-[calc(0px-var(--st-blur))]',
  'left-[calc(0px-var(--st-blur))]',
  'w-[calc(100%+var(--st-blur)*2)]',
  'h-[calc(100%+var(--st-blur)*2)]',
  '[filter:blur(var(--st-blur))_var(--st-filter-url)]',
];

export abstract class ImageBackgroundProviderBase<
  T extends ImageBackgroundProviderSettingsBase,
> extends BackgroundProvider<T> {
  #unsubscribeFilterChange!: () => void;
  #unsubscribeResizeType!: () => void;
  #lastImageUrl: string | undefined | null;
  #img: HTMLImageElement | undefined;
  #imageColor = new Lazy(() => new FastAverageColorEx());
  #resizeObserver: ResizeObserver | undefined;
  readonly history: ImageBackgroundHistory;
  #sharedMeta: {
    url?: string;
    dominant?: { color: string; isDark: boolean };
    corner?: { x: number; y: number; color: string; isDark: boolean };
  } = {};
  constructor(node: HTMLElement, settings: T, providerName: string) {
    super(node, settings);
    this.history = new ImageBackgroundHistory(providerName);
  }

  get canGoBack() {
    return this.history.hasPrevious;
  }

  async goBack() {
    const url = this.history.getPrevious();
    if (url) {
      await this.setImage(url);
    }
  }

  get canGoNext() {
    return this.history.hasNext;
  }

  async goNext(abortSignal: AbortSignal) {
    const url = this.history.getNext();
    if (url) {
      await this.setImage(url);
    } else {
      await this.forceUpdate(abortSignal);
    }
  }

  protected async setImage(url: string | undefined | null, addToHistory: boolean = false): Promise<void> {
    if (url === this.#lastImageUrl) return;

    this.#releaseBlob();

    if (this.#lastImageUrl && !this.#lastImageUrl.startsWith('blob://')) {
      ResourcesToPreload.delete({ src: this.#lastImageUrl });
    }

    if (this.#sharedMeta.url !== url) {
      this.#sharedMeta = { url: url || '' };
      this.#updateSharedMeta();
    }

    if (url) {
      if (url.startsWith(`${OpfsSchema}://`)) {
        const blob = await Opfs.get(this.settings.url.value);
        url = URL.createObjectURL(blob);
      } else {
        ResourcesToPreload.add({ src: url, as: 'image' });
      }

      this.#img!.src = url;
      this.#img!.style.visibility = 'visible';
      if (addToHistory && !url.startsWith('blob://')) {
        this.history.add(url);
      }
    } else {
      this.#img!.src = '';
      this.#img!.style.visibility = 'hidden';
    }

    this.#lastImageUrl = url;
  }

  #updateCornerColor() {
    let updateCornerColor = false;
    if (!this.#sharedMeta.corner?.color) {
      updateCornerColor = true;
    } else {
      const { top, left } = this.#imageColor.value.getViewPort(this.#img!);
      updateCornerColor = this.#sharedMeta.corner.x !== left || this.#sharedMeta.corner.y !== top;
    }

    if (updateCornerColor) {
      const cornerColorResult = this.#imageColor.value.getCornerColor(this.#img!, 43);
      if (cornerColorResult) {
        this.#sharedMeta.corner = {
          x: cornerColorResult.x,
          y: cornerColorResult.y,
          color: cornerColorResult.color.hex,
          isDark: cornerColorResult.color.isDark,
        };
      }
      this.#updateSharedMeta();
    }

    if (!this.#sharedMeta.corner?.color) {
      if (!this.#sharedMeta.dominant?.color) {
        const dominantColor = this.#imageColor.value.getDominantColor(this.#img!);
        this.#sharedMeta.dominant = { color: dominantColor.hex, isDark: dominantColor.isDark };
      }

      this.#sharedMeta.corner = {
        x: 0,
        y: 0,
        color: this.#sharedMeta.dominant.color,
        isDark: this.#sharedMeta.dominant.isDark,
      };
      this.#updateSharedMeta();
    }

    if (this.#sharedMeta.corner) {
      this.node.dispatchEvent(
        new CustomEvent<BackgroundCornerColorChangedEventArgs>('cornerColorChanged', {
          detail: { color: this.#sharedMeta.corner.color, isDark: this.#sharedMeta.corner.isDark },
        }),
      );
    }
  }

  #updateSharedMeta() {
    storage.local.set({ [IMAGE_BACKGROUND_PROVIDER_SHARED_META_KEY]: this.#sharedMeta });
  }

  #updateDominantColor() {
    if (this.settings.resizeType.value === ImageResizeType.Contain) {
      if (!this.#sharedMeta.dominant?.color) {
        const dominantColor = this.#imageColor.value.getDominantColor(this.#img!);
        this.#sharedMeta.dominant = { color: dominantColor.hex, isDark: dominantColor.isDark };
        this.#updateSharedMeta();
      }
      this.#img!.style.backgroundColor = this.#sharedMeta.dominant.color;
    } else {
      this.#img!.style.backgroundColor = '';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async apply(abortSignal: AbortSignal) {
    abortSignal.throwIfAborted();
    this.#sharedMeta =
      (await storage.local.get(IMAGE_BACKGROUND_PROVIDER_SHARED_META_KEY))[IMAGE_BACKGROUND_PROVIDER_SHARED_META_KEY] ||
      {};
    this.#img = this.node.appendChild(document.createElement('img'));
    this.#img.crossOrigin = 'anonymous';
    this.#img.alt = '';
    this.#img.classList.add('w-full', 'h-full', 'max-w-none', 'max-h-none', 'select-none');
    this.#img.draggable = false;
    this.#img.onload = async () => {
      await this.#updateDominantColor();
      await this.#updateCornerColor();
    };
    const updateCornerColorDeb = debounce(async () => {
      await this.#updateDominantColor();
      await this.#updateCornerColor();
    }, 500);
    this.#resizeObserver = new ResizeObserver(updateCornerColorDeb);
    this.#resizeObserver.observe(this.#img);
    this.#unsubscribeResizeType = this.settings.resizeType.subscribe(updateCornerColorDeb);
    this.#applyFilters();
  }

  destroy(): void {
    this.#releaseBlob();
    this.#unsubscribeFilterChange!();
    this.#unsubscribeResizeType!();
    this.#resizeObserver?.unobserve(this.#img!);
    this.#resizeObserver?.disconnect();
    if (this.#imageColor.isConstructed) {
      this.#imageColor.value.destroy();
    }
    this.#img?.remove();
    this.node.classList.remove(...BaseNodeClassList);
    this.node.style.removeProperty('--st-blur');
    this.node.style.removeProperty('--st-filter-url');
  }

  #applyFilters() {
    this.node.classList.add(...BaseNodeClassList);

    this.#updateFilters();
    const updateFiltersDeb = debounce(() => this.#updateFilters(), 0);

    const blurUnsubscribe = this.settings.blur.subscribe(() => updateFiltersDeb());
    const filterUnsubscribe = this.settings.filter.subscribe(() => updateFiltersDeb());
    const resizeTypeUnsubscribe = this.settings.resizeType.subscribe(() => updateFiltersDeb());
    this.#unsubscribeFilterChange = () => {
      blurUnsubscribe();
      filterUnsubscribe();
      resizeTypeUnsubscribe();
    };
  }

  #updateFilters() {
    const {
      blur: { value: blur },
      filter: { value: filter },
      resizeType: { value: resizeType },
    } = this.settings;

    this.node.style.setProperty('--st-blur', `${blur}px`);
    this.node.style.setProperty('--st-filter-url', filter ? `url("#${filter}")` : ' ');

    if (resizeType === ImageResizeType.Cover) {
      this.#img!.style.objectFit = 'cover';
    } else if (resizeType === ImageResizeType.Contain) {
      this.#img!.style.objectFit = 'contain';
    } else {
      this.#img!.style.objectFit = 'cover';
    }
  }

  #releaseBlob() {
    if (this.#lastImageUrl?.startsWith('blob://')) {
      URL.revokeObjectURL(this.#lastImageUrl);
    }
  }
}
