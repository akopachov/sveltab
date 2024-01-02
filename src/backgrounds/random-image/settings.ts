import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import { useObservable, type Observable } from '$models/observable';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.searchTerms = useObservable(initial.searchTerms || '');
    this.updateInterval = useObservable(initial.updateInterval || 60);
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
  }

  searchTerms: Observable<string>;
  updateInterval: Observable<number>;
  blur: Observable<number>;
  filter: Observable<Filter | undefined>;
}
