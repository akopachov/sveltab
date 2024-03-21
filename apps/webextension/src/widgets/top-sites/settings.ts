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
    this.font = new FontSettings(initial.font || { size: 5 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.textColor = useObservable(initial.textColor || '#000');
    this.itemsPerRow = useObservable(initial.itemsPerRow || 10);
    this.rowsCount = useObservable(initial.rowsCount || 1);
    this.showTitle = useObservable(initial.showTitle ?? true);
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly textColor: Observable<string>;
  readonly itemsPerRow: Observable<number>;
  readonly rowsCount: Observable<number>;
  readonly showTitle: Observable<boolean>;
}
