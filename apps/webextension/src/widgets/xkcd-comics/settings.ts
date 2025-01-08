import { useObservable, type Observable } from '$lib/observable.svelte';
import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$lib/widget-settings';

export const enum XKCDComicsStream {
  Latest = 'latest',
  Random = 'random',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.updateInterval = useObservable(initial.updateInterval || 600);
    this.stream = useObservable(initial.stream || XKCDComicsStream.Latest);
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
  }

  readonly updateInterval: Observable<number>;
  readonly stream: Observable<XKCDComicsStream>;
  readonly backgroundColor: Observable<string>;
}
