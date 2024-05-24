import { useObservable, type Observable } from '$lib/observable';
import { ImageResizeType } from '$lib/cdn';
import type { Filter } from '$stores/active-filters-store';
import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$lib/background-settings';

export class ImageBackgroundProviderSettingsBase extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<ImageBackgroundProviderSettingsBase>) {
    super();
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
    this.resizeType = useObservable(initial.resizeType || ImageResizeType.Cover);
  }

  readonly blur: Observable<number>;
  readonly filter: Observable<Filter | undefined>;
  readonly resizeType: Observable<ImageResizeType>;
}
