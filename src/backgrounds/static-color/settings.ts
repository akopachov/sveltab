import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from "$models/background-settings";

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.color = initial.color || '#fff';
  }

  color: string;
}
