import { useObservable, type Observable } from '$lib/observable';
import {
  FontSettings,
  ShadowSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
} from '$lib/widget-settings';
import type { ExchangerateApiSupportedCurrencies } from './types/exchangerate';

export type CryptoAssetRef = { id: string; name: string; code: string };

export class Settings extends WidgetSettingsExtra {
  constructor(initial: WidgetSettingsExtraInitial<Settings>) {
    super();
    this.backgroundColor = useObservable(initial.backgroundColor || '#fff');
    this.backgroundBlur = useObservable(initial.backgroundBlur || 0);
    this.textColor = useObservable(initial.textColor || '#000');
    this.chartLineColor = useObservable(initial.chartLineColor || '#000');
    this.asset = useObservable(initial.asset || { id: 'bitcoin', name: 'Bitcoin', code: 'BTC' });
    this.displayCurrency = useObservable(initial.displayCurrency || 'USD');
    this.font = new FontSettings(initial.font || { size: 15 });
    this.textShadow = new ShadowSettings(initial.textShadow || {});
  }

  readonly backgroundColor: Observable<string>;
  readonly backgroundBlur: Observable<number>;
  readonly textColor: Observable<string>;
  readonly chartLineColor: Observable<string>;
  readonly asset: Observable<CryptoAssetRef>;
  readonly displayCurrency: Observable<ExchangerateApiSupportedCurrencies>;
  readonly font: FontSettings;
  readonly textShadow: ShadowSettings;
}