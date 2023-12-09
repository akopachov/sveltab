import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from "$models/background-settings";

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.searchTerms = initial.searchTerms || '';
    this.updateInterval = initial.updateInterval || 60;
    this.blur = initial.blur || 0;
  }

  searchTerms: string;
  updateInterval: number;
  blur: number;
}
