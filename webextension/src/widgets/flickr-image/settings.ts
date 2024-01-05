import { useObservable, type Observable } from '$lib/observable';
import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$lib/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.updateInterval = useObservable(initial.updateInterval || 600);
    this.searchTopic = useObservable(initial.searchTopic || 'random');
  }

  readonly updateInterval: Observable<number>;
  readonly searchTopic: Observable<string>;
}
