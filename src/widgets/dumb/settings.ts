import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.color = initial.color || '#000';
  }

  color: string;
}
