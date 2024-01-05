import { useObservable, type Observable, type Unobserved } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';

export type GeoLocationInitial = Partial<Unobserved<GeoLocation>>;
export class GeoLocation {
  constructor(initial: GeoLocationInitial) {
    this.city = useObservable(initial.city || '');
    this.latitude = useObservable(initial.latitude || 0);
    this.longitude = useObservable(initial.longitude || 0);
    this.country = useObservable(initial.country || '');
    this.admin1 = useObservable(initial.admin1 || '');
    this.admin2 = useObservable(initial.admin2 || '');
  }

  readonly city: Observable<string>;
  readonly latitude: Observable<number>;
  readonly longitude: Observable<number>;
  readonly country: Observable<string>;
  readonly admin1: Observable<string>;
  readonly admin2: Observable<string>;
}

export enum MeasurementUnits {
  Metric = 'metric',
  Imperial = 'imperial',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.assetPack = useObservable(initial.assetPack || 'default');
    this.measurementUnits = useObservable(MeasurementUnits.Metric);
    this.location = new GeoLocation(initial.location || {});
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly assetPack: Observable<string>;
  readonly measurementUnits: Observable<MeasurementUnits>;

  readonly location: GeoLocation;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
}
