import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';
import { HolidayType } from './api';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.textColorToday = useObservable(initial.textColorToday || '#000');
    this.font = new FontSettings(initial.font || {});
    this.fontToday = new FontSettings(initial.fontToday || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.country = useObservable(initial.country || 'US');
    this.upcommingCount = useObservable(initial.upcommingCount || 5);
    this.pastCount = useObservable(initial.pastCount || 0);
    this.typesOfInterest = useObservable(initial.typesOfInterest || [HolidayType.Public]);
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly textColorToday: Observable<string>;
  readonly font: FontSettings;
  readonly fontToday: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly country: Observable<string>;
  readonly upcommingCount: Observable<number>;
  readonly pastCount: Observable<number>;
  readonly typesOfInterest: Observable<HolidayType[]>;
  readonly textStroke: TextStrokeSettings;
}
