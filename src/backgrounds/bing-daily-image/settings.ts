import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.locale = initial.url || 'random';
    this.blur = initial.blur || 0;
  }

  locale: string;
  blur: number;
}
