import { useObservable, type Observable } from '$lib/observable.svelte';
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
    this.updateInterval = useObservable(initial.updateInterval || 600);
    this.font = new FontSettings(initial.font || { size: 15 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
    this.translation = useObservable(initial.translation || 'eng_pev');
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly updateInterval: Observable<number>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textStroke: TextStrokeSettings;
  readonly translation: Observable<string>;
}
