import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export enum NetworkInfoVariables {
  IP = 'ip',
  Network = 'network',
  ISP = 'isp',
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
      initial.showVariables || [NetworkInfoVariables.IP, NetworkInfoVariables.Network, NetworkInfoVariables.ISP],
    );
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly showVariables: Observable<NetworkInfoVariables[]>;
}
