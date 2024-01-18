import { useObservable, type Observable } from '$lib/observable';
import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$lib/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.html = useObservable(initial.html || '<div style="background-color: #eee; width: 100%; height: 100%;"></div>');
  }

  readonly html: Observable<string>;
}
