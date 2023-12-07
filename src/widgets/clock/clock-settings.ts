import { FontSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export enum ClockFormat {
  TwelveHrs,
  TwentyFourHrs
}

export class ClockSettings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<ClockSettings>) {
    super();
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.textColor = initial.textColor || '#000';
    this.clockFormat = <ClockFormat>initial.clockFormat || ClockFormat.TwelveHrs;
    this.font = new FontSettings(initial.font || {});
  }

  backgroundColor: string;
  textColor: string;
  clockFormat: ClockFormat;
  font: FontSettings;
}
