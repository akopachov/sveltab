import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.color = useObservable(initial.color || '#eee');
  }

  readonly color: Observable<string>;
}
