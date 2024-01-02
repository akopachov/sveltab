import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$models/background-settings';
import { useObservable, type Observable } from '$models/observable';

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.color = useObservable(initial.color || '#eee');
  }

  color: Observable<string>;
}
