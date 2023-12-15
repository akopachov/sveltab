import { FontSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export type SearchProvider = 'google' | 'duckduckgo' | 'bing' | 'youtube';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.backgroundBlur = initial.backgroundBlur || 0;
    this.textColor = initial.textColor || '#000';
    this.searchProvider = initial.searchProvider || 'duckduckgo';
    this.font = new FontSettings(initial.font || {});
  }

  backgroundColor: string;
  backgroundBlur: number;
  textColor: string;
  searchProvider: SearchProvider;
  readonly font: FontSettings;
}
