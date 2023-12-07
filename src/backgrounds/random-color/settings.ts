import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from "$models/background-settings";

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.luminosity = initial.luminosity || 'random';
    this.hue = initial.hue || 'random';
  }

  luminosity: 'bright' | 'light' | 'dark' | 'random';
  hue: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'random';
}
