import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.updateInterval = initial.updateInterval || 600;
    this.searchTopic = initial.searchTopic || 'random';
  }

  updateInterval: number;
  searchTopic: string;
}
