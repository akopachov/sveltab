import { useObservable, type Observable } from '$models/observable';
import { WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$models/widget-settings';

export enum IconSource {
  Favicon = 'favicon',
  Direct = 'direct',
  Iconify = 'iconify',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.url = useObservable(initial.url || '');
    this.icon = useObservable(initial.icon || '');
    this.iconColor = useObservable(initial.iconColor || '#000');
    this.iconSource = useObservable(initial.iconSource || IconSource.Favicon);
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
  }

  readonly url: Observable<string>;
  readonly icon: Observable<string>;
  readonly iconColor: Observable<string>;
  readonly iconSource: Observable<IconSource>;
  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
}
