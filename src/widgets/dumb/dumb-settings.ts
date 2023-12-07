import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export class DumbSettings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<DumbSettings>) {
    super();
    this.color = initial.color || '#000';
  }

  color: string;
}
