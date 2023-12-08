import { FontSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export enum ClockFormat {
  TwelveHrs,
  TwentyFourHrs
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.backgroundBlur = initial.backgroundBlur || 0;
    this.textColor = initial.textColor || '#000';
    this.clockFormat = <ClockFormat>initial.clockFormat || ClockFormat.TwelveHrs;
    this.font = new FontSettings(initial.font || {});
  }

  backgroundColor: string;
  backgroundBlur: number;
  textColor: string;
  clockFormat: ClockFormat;
  font: FontSettings;
}
