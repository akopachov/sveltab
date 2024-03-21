import type { BackgroundSettingsExtra } from '$lib/background-settings';
import type { Observable } from '$lib/observable';
import type { Filter } from '$stores/active-filters-store';
import { BackgroundProvider } from '$stores/background-catalog';
import { ResourcesToPreload } from '$stores/preload-resources';
import debounce from 'debounce';

export abstract class ImageBackgroundProviderBase<
  T extends BackgroundSettingsExtra & { blur: Observable<number>; filter: Observable<Filter | undefined> },
> extends BackgroundProvider<T> {
  #unsubscribeFilterChange!: () => void;
  #lastImageUrl: string | undefined | null;
  constructor(node: HTMLElement, settings: T) {
    super(node, settings);
  }

  protected setImage(url: string | undefined | null): void {
    if (this.#lastImageUrl) {
      ResourcesToPreload.delete({ src: this.#lastImageUrl });
    }

    this.node.style.backgroundImage = url ? `url("${url}")` : '';
    if (url) {
      this.node.style.backgroundImage = `url("${url}")`;
      ResourcesToPreload.add({ src: url, as: 'image' });
    } else {
      this.node.style.backgroundImage = '';
    }

    this.#lastImageUrl = url;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(abortSignal: AbortSignal) {
    this.node.style.backgroundSize = 'cover';
    this.node.style.backgroundPosition = 'center';
    this.node.style.transition = 'background-image 0.3s ease-in-out';
    this.#applyFilters();
  }

  destroy(): void {
    this.#unsubscribeFilterChange!();
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
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
    this.#unsubscribeFilterChange = () => {
      blurUnsubscribe();
      filterUnsubscribe();
    };
  }

  #updateFilters() {
    const {
      blur: { value: blur },
      filter: { value: filter },
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
  }
}
