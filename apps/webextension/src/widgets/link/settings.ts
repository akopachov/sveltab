import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export enum IconSource {
  Favicon = 'favicon',
  Direct = 'direct',
  Iconify = 'iconify',
  Local = 'local',
}

export enum TextPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.title = useObservable(initial.title || '');
    this.titlePosition = useObservable(initial.titlePosition || TextPosition.Bottom);
    this.url = useObservable(initial.url || '');
    this.icon = useObservable(initial.icon || '');
    this.iconColor = useObservable(initial.iconColor || '#000');
    this.iconSource = useObservable(initial.iconSource || IconSource.Favicon);
    this.padding = useObservable(initial.padding ?? 5);
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.font = new FontSettings(initial.font || { size: 5 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textColor = useObservable(initial.textColor || '#000');
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly title: Observable<string>;
  readonly titlePosition: Observable<TextPosition>;
  readonly url: Observable<string>;
  readonly icon: Observable<string>;
  readonly iconColor: Observable<string>;
  readonly iconSource: Observable<IconSource>;
  readonly padding: Observable<number>;
  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textColor: Observable<string>;
  readonly textStroke: TextStrokeSettings;
}
