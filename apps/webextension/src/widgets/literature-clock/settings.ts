import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.timeTextColor = useObservable(initial.timeTextColor || '#000');
    this.font = new FontSettings(initial.font || { size: 7 });
    this.timeFont = new FontSettings(initial.timeFont || { size: 8, weight: 800 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
    this.timeTextStroke = new TextStrokeSettings(initial.timeTextStroke || {});
    this.timeTextShadow = new ShadowSettings(initial.textShadow || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly timeTextColor: Observable<string>;
  readonly font: FontSettings;
  readonly timeFont: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textStroke: TextStrokeSettings;
  readonly timeTextStroke: TextStrokeSettings;
  readonly timeTextShadow: ShadowSettings;
}
