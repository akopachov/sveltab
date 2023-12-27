import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.locale = initial.url || 'random';
    this.blur = initial.blur || 0;
    this.filter = initial.filter;
  }

  locale: string;
  blur: number;
  filter: Filter | undefined;
}
