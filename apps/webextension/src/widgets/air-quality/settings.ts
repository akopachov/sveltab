import { useObservable, type Observable } from '$lib/observable.svelte';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';
import { GeoLocation } from '$shared-components/location-select.svelte';

export enum AirQualityLegislation {
  European = 'european_aqi',
  USA = 'us_aqi',
}

export enum AirQualityVariables {
  PM2_5 = 'pm2_5',
  PM10 = 'pm10',
  CarbonMonoxide = 'carbon_monoxide',
  SulfurDioxide = 'sulfur_dioxide',
  NitrogenDioxide = 'nitrogen_dioxide',
  Ozone = 'ozone',
}

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
    this.legislation = useObservable(initial.legislation || AirQualityLegislation.European);
    this.queryUserLocation = useObservable(initial.queryUserLocation ?? true);
    this.location = new GeoLocation(initial.location || {});
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.showVariables = useObservable(
      initial.showVariables || [
        AirQualityVariables.PM2_5,
        AirQualityVariables.PM10,
        AirQualityVariables.CarbonMonoxide,
      ],
    );
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly textStroke: TextStrokeSettings;
  readonly legislation: Observable<AirQualityLegislation>;
  readonly queryUserLocation: Observable<boolean>;

  readonly location: GeoLocation;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly showVariables: Observable<AirQualityVariables[]>;
}
