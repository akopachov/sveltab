import { ImageResizeType } from '$lib/cdn';
import { BackgroundProvider } from '$stores/background-catalog';
import { ResourcesToPreload } from '$stores/preload-resources';
import debounce from 'debounce';
import type { ImageBackgroundProviderSettingsBase } from './settings-base';
import { FastAverageColor } from 'fast-average-color';
import { Lazy } from '$lib/lazy';

const imageColor = new Lazy<FastAverageColor>(() => new FastAverageColor());

export abstract class ImageBackgroundProviderBase<
  T extends ImageBackgroundProviderSettingsBase,
> extends BackgroundProvider<T> {
  #unsubscribeFilterChange!: () => void;
  #lastImageUrl: string | undefined | null;
  #img: HTMLImageElement | undefined;
  constructor(node: HTMLElement, settings: T) {
    super(node, settings);
  }

  protected setImage(url: string | undefined | null): void {
    if (this.#lastImageUrl) {
      ResourcesToPreload.delete({ src: this.#lastImageUrl });
    }

    this.#img!.src = url || '';
    if (url) {
      this.#img!.style.visibility = 'visible';
      ResourcesToPreload.add({ src: url, as: 'image' });
    } else {
      this.#img!.style.visibility = 'hidden';
    }

    this.#lastImageUrl = url;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(abortSignal: AbortSignal) {
    abortSignal.throwIfAborted();
    this.#img = this.node.appendChild(document.createElement('img'));
    this.#img.style.width = '100%';
    this.#img.style.height = '100%';
    this.#img.style.maxWidth = 'none';
    this.#img.style.maxHeight = 'none';
    this.#img.crossOrigin = 'anonymous';
    this.#img.onload = () => {
      if (this.settings.resizeType.value === ImageResizeType.Contain) {
        this.node.style.backgroundColor = imageColor.value.getColor(this.#img!, {
          algorithm: 'dominant',
          mode: 'speed',
          silent: true,
        }).hex;
      } else {
        this.node.style.backgroundColor = '';
      }
    };
    this.#applyFilters();
  }

  destroy(): void {
    this.#unsubscribeFilterChange!();
    this.#img?.remove();
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
    this.node.style.backgroundRepeat = '';
    this.node.style.backgroundColor = '';
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
}
