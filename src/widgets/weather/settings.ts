import { Subscribable, type OmitSubscribable } from '$models/subscribable';
import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$models/widget-settings';

export type GeoLocationInitial = Partial<OmitSubscribable<GeoLocation>>;
export class GeoLocation extends Subscribable {
  constructor(initial: GeoLocationInitial) {
    super();
    this.city = initial.city || '';
    this.latitude = initial.latitude || 0;
    this.longitude = initial.longitude || 0;
    this.country = initial.country || '';
  }
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

export enum MeasurementUnits {
  Metric = 'metric',
  Imperial = 'imperial',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = initial.backgroundColor || '#fff';
    this.backgroundBlur = initial.backgroundBlur || 0;
    this.textColor = initial.textColor || '#000';
    this.assetPack = initial.assetPack || 'default';
    this.measurementUnits = MeasurementUnits.Metric;
    this.location = new GeoLocation(initial.location || {});
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
  }

  backgroundColor: string;
  backgroundBlur: number;
  textColor: string;
  assetPack: string;
  measurementUnits: MeasurementUnits;

  readonly location: GeoLocation;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
}
