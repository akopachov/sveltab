import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.country = useObservable(initial.country || 'US');
    this.upcommingCount = useObservable(initial.upcommingCount || 5);
    this.pastCount = useObservable(initial.pastCount || 0);
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly country: Observable<string>;
  readonly upcommingCount: Observable<number>;
  readonly pastCount: Observable<number>;
}
