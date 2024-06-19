import { ImageBackgroundProviderBase } from '$backgrounds/common-image/provider-base';
import debounce from 'debounce';
import type { Settings } from './settings';
import { secondsToMilliseconds } from 'date-fns';
import { Opfs, OpfsSchema } from '$lib/opfs';

export class StaticImageBackgroundProvider extends ImageBackgroundProviderBase<Settings> {
  #unsubscribe!: () => void;
  #lastUrl: string | null = null;
  get canGoNext() {
    return false;
  }
  apply(abortSignal: AbortSignal): void {
    super.apply(abortSignal);
    const updateDeb = debounce(() => this.forceUpdate(), secondsToMilliseconds(1));
    this.#unsubscribe = this.settings.url.subscribe(() => updateDeb());
    this.forceUpdate();
  }
  forceUpdate(): void {
    this.#releaseBlob();
    if (this.settings.url.value.startsWith(`${OpfsSchema}://`)) {
      Opfs.get(this.settings.url.value).then(blob => {
        const url = URL.createObjectURL(blob);
        this.setImage(url);
        this.#lastUrl = url;
      });
    } else {
      this.setImage(this.settings.url.value);
      this.#lastUrl = this.settings.url.value;
    }
  }
  destroy(): void {
    this.#releaseBlob();
    super.destroy();
    this.#unsubscribe();
  }
  #releaseBlob() {
    if (this.#lastUrl?.startsWith('blob://')) {
      URL.revokeObjectURL(this.#lastUrl);
    }
  }
}
