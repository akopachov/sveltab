import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  TextStrokeSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';
import { GeoLocation } from '$shared-components/location-select.svelte';

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
    this.measurementUnits = useObservable(initial.measurementUnits || MeasurementUnits.Metric);
    this.queryUserLocation = useObservable(initial.queryUserLocation ?? false);
    this.location = new GeoLocation(initial.location || {});
    this.font = new FontSettings(initial.font || {});
    this.textShadow = new ShadowSettings(initial.textShadow || {});
    this.showDetails = useObservable(initial.showDetails ?? true);
    this.showCountry = useObservable(initial.showCountry ?? true);
    this.showAdminArea1 = useObservable(initial.showAdminArea1 ?? true);
    this.showCity = useObservable(initial.showCity ?? true);
    this.showCurrentIcon = useObservable(initial.showCurrentIcon ?? true);
    this.textStroke = new TextStrokeSettings(initial.textStroke || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly assetPack: Observable<string>;
  readonly measurementUnits: Observable<MeasurementUnits>;
  readonly queryUserLocation: Observable<boolean>;

  readonly location: GeoLocation;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
  readonly showDetails: Observable<boolean>;
  readonly showCountry: Observable<boolean>;
  readonly showAdminArea1: Observable<boolean>;
  readonly showCity: Observable<boolean>;
  readonly showCurrentIcon: Observable<boolean>;
  readonly textStroke: TextStrokeSettings;
}
