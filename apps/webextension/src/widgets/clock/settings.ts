import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export const enum ClockFormat {
  TwelveHrs,
  TwentyFourHrs,
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.clockFormat = useObservable(<ClockFormat>initial.clockFormat || ClockFormat.TwelveHrs);
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
    this.timezone = useObservable(initial.timezone || 'local');
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly clockFormat: Observable<ClockFormat>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textStroke: TextStrokeSettings;
  readonly timezone: Observable<string | 'local'>;
}
