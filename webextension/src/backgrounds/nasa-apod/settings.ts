import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
  }

  readonly blur: Observable<number>;
  readonly filter: Observable<Filter | undefined>;
}
