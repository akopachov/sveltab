import { useObservable, type Observable } from '$lib/observable';
import { FontSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$lib/widget-settings';

export type SearchProvider = 'google' | 'duckduckgo' | 'bing' | 'youtube';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.searchProvider = useObservable(initial.searchProvider || 'duckduckgo');
    this.font = new FontSettings(initial.font || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly searchProvider: Observable<SearchProvider>;
  readonly font: FontSettings;
}
