import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import { useObservable, type Observable } from '$models/observable';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.locale = useObservable(initial.locale || 'random');
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
  }

  readonly locale: Observable<string>;
  readonly blur: Observable<number>;
  readonly filter: Observable<Filter | undefined>;
}
