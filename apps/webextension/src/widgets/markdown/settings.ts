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
    this.markdown = useObservable(initial.markdown || '');
    this.html = useObservable(initial.html || '');
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.font = new FontSettings(initial.font || { size: 15 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly markdown: Observable<string>;
  readonly html: Observable<string>;
  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textStroke: TextStrokeSettings;
}
