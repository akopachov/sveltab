import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export enum IconSource {
  Favicon = 'favicon',
  Direct = 'direct',
  Iconify = 'iconify',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.url = initial.url || '';
    this.icon = initial.icon || '';
    this.iconColor = initial.iconColor || '#000';
    this.iconSource = initial.iconSource || IconSource.Favicon;
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.backgroundBlur = initial.backgroundBlur || 0;
  }

  url: string;
  icon: string;
  iconColor: string;
  iconSource: IconSource;
  backgroundColor: string;
  backgroundBlur: number;
}
