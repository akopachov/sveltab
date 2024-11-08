import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export enum TextAlign {
  Left = 'left',
  Middle = 'center',
  Right = 'right',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.text = useObservable(initial.text || '');
    this.textAlign = useObservable(initial.textAlign || TextAlign.Left);
    this.font = new FontSettings(initial.font || { size: 15 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly text: Observable<string>;
  readonly textAlign: Observable<TextAlign>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textStroke: TextStrokeSettings;
}
