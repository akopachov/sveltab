import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import { useObservable, type Observable } from '$models/observable';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.luminosity = useObservable(initial.luminosity || 'random');
    this.hue = useObservable(initial.hue || 'random');
  }

  readonly luminosity: Observable<'bright' | 'light' | 'dark' | 'random'>;
  readonly hue: Observable<'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'random'>;
}
