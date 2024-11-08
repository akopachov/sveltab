import { useObservable, type Observable } from '$lib/observable.svelte';
import { ShadowSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial } from '$lib/widget-settings';
import type { WatchfaceKey } from './watchfaces';

export class AnalogueClockSettings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<AnalogueClockSettings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#ffffff00');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.watchface = useObservable<WatchfaceKey>(initial.watchface || 'default');
    this.watchfaceColor = useObservable(initial.watchfaceColor || '#000');
    this.watchfaceBackgroundColor = useObservable(initial.watchfaceBackgroundColor || '#ffffff00');
    this.hourMarksColor = useObservable(initial.hourMarksColor || '#000');
    this.hourArmColor = useObservable(initial.hourArmColor || '#000');
    this.minuteArmColor = useObservable(initial.minuteArmColor || '#000');
    this.secondArmColor = useObservable(initial.secondArmColor || '#000');
    this.displaySecondArm = useObservable(initial.displaySecondArm ?? true);
    this.shadow = new ShadowSettings(initial.shadow || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly watchface: Observable<WatchfaceKey>;
  readonly watchfaceColor: Observable<string>;
  readonly watchfaceBackgroundColor: Observable<string>;
  readonly hourMarksColor: Observable<string>;
  readonly hourArmColor: Observable<string>;
  readonly minuteArmColor: Observable<string>;
  readonly secondArmColor: Observable<string>;
  readonly displaySecondArm: Observable<boolean>;
  readonly shadow: ShadowSettings;
}
