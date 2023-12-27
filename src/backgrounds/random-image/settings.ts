import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import type { Filter } from '$stores/active-filters-store';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.searchTerms = initial.searchTerms || '';
    this.updateInterval = initial.updateInterval || 60;
    this.blur = initial.blur || 0;
    this.filter = initial.filter;
  }

  searchTerms: string;
  updateInterval: number;
  blur: number;
  filter: Filter | undefined;
}
