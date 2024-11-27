import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export type SearchProviderName =
  | 'google'
  | 'duckduckgo'
  | 'bing'
  | 'youtube'
  | 'brave'
  | 'metacrawler'
  | 'searx'
  | 'custom';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.searchProvider = useObservable(initial.searchProvider || 'duckduckgo');
    this.searchSuggestionEnabled = useObservable(initial.searchSuggestionEnabled ?? true);
    this.font = new FontSettings(initial.font || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
    this.customSearchProviderSearchUrl = useObservable(initial.customSearchProviderSearchUrl || '');
    this.searxBaseUrl = useObservable(initial.searxBaseUrl || '');
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly searchProvider: Observable<SearchProviderName>;
  readonly searchSuggestionEnabled: Observable<boolean>;
  readonly font: FontSettings;
  readonly textStroke: TextStrokeSettings;
  readonly customSearchProviderSearchUrl: Observable<string>;
  readonly searxBaseUrl: Observable<string>;
}
