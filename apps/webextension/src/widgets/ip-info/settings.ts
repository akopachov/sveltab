import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export const enum NetworkInfoVariables {
  IP = 'ip',
  ASN = 'asn',
  ISP = 'isp',
  Location = 'location',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.showVariables = useObservable(
      initial.showVariables || [
        NetworkInfoVariables.IP,
        NetworkInfoVariables.ISP,
        NetworkInfoVariables.Location,
        NetworkInfoVariables.ASN,
      ],
    );
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly showVariables: Observable<NetworkInfoVariables[]>;
  readonly textStroke: TextStrokeSettings;
}
