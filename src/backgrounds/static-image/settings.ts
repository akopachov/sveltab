import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import { useObservable, type Observable } from '$models/observable';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.url = useObservable(initial.url || '');
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
  }

  url: Observable<string>;
  blur: Observable<number>;
  filter: Observable<Filter | undefined>;
}
