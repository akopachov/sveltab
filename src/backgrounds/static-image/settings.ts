import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from "$models/background-settings";

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.url = initial.url || '';
  }

  url: string;
}
