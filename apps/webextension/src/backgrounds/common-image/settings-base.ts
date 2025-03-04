import { useObservable, type Observable } from '$lib/observable.svelte';
import { ImageResizeType } from '$lib/cdn';
import type { Filter } from '$stores/active-filters-store';
import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$lib/background-settings';

export class ImageBackgroundProviderSettingsBase extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<ImageBackgroundProviderSettingsBase>) {
    super();
    this.blur = useObservable(initial.blur || 0);
    this.brightness = useObservable(initial.brightness || 1.0);
    this.filter = useObservable(initial.filter);
    this.resizeType = useObservable(initial.resizeType || ImageResizeType.Cover);
  }

  readonly blur: Observable<number>;
  readonly brightness: Observable<number>;
  readonly filter: Observable<Filter | undefined>;
  readonly resizeType: Observable<ImageResizeType>;
}
