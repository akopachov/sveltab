import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$models/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.backgroundBlur = initial.backgroundBlur || 0;
    this.textColor = initial.textColor || '#000';
    this.updateInterval = initial.updateInterval || 600;
    this.font = new FontSettings(initial.font || { size: 15 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
  }

  backgroundColor: string;
  backgroundBlur: number;
  textColor: string;
  updateInterval: number;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
}
