import { ImageResizeType } from '$lib/cdn';
import { BackgroundProvider } from '$stores/background-catalog';
import { ResourcesToPreload } from '$stores/preload-resources';
import debounce from 'debounce';
import type { ImageBackgroundProviderSettingsBase } from './settings-base';
import { FastAverageColorEx } from './fast-average-color-ex';
import type { BackgroundCornerColorChangedEventArgs } from '$actions/dynamic-background';
import { Opfs, OpfsSchema } from '$lib/opfs';
import { Lazy } from '$lib/lazy';
import { storage } from '$stores/storage';

const IMAGE_BACKGROUND_PROVIDER_SHARED_META_KEY = 'imageBackgroundProviderSharedMeta';

export abstract class ImageBackgroundProviderBase<
  T extends ImageBackgroundProviderSettingsBase,
> extends BackgroundProvider<T> {
  #unsubscribeFilterChange!: () => void;
  #unsubscribeResizeType!: () => void;
  #lastImageUrl: string | undefined | null;
  #img: HTMLImageElement | undefined;
  #imageColor = new Lazy(() => new FastAverageColorEx());
  #resizeObserver: ResizeObserver | undefined;
  #sharedMeta: {
    url?: string;
    dominant?: { color: string; isDark: boolean };
    corner?: { x: number; y: number; color: string; isDark: boolean };
  } = {};
  constructor(node: HTMLElement, settings: T) {
    super(node, settings);
  }

  protected async setImage(url: string | undefined | null): Promise<void> {
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
    this.#img.style.width = '100%';
    this.#img.style.height = '100%';
    this.#img.style.maxWidth = 'none';
    this.#img.style.maxHeight = 'none';
    this.#img.crossOrigin = 'anonymous';
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
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
    this.node.style.backgroundRepeat = '';
    this.node.style.transition = '';
    this.node.style.filter = '';
    this.node.style.inset = '';
    this.node.style.width = '';
    this.node.style.height = '';
    this.node.style.position = '';
  }

  #applyFilters() {
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

    const filters = [];
    if (blur) {
      filters.push(`blur(${blur}px)`);
    }
    if (filter) {
      filters.push(`url("#${filter}")`);
    }

    this.node.style.filter = filters.join(' ');
    if (blur > 0) {
      this.node.style.position = 'absolute';
      this.node.style.inset = `-${blur}px ${blur}px ${blur}px -${blur}px`;
      this.node.style.width = `calc(100% + ${blur * 2}px)`;
      this.node.style.height = `calc(100% + ${blur * 2}px)`;
    } else {
      this.node.style.inset = '';
      this.node.style.width = '';
      this.node.style.height = '';
      this.node.style.position = '';
    }

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
