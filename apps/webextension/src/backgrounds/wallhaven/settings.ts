import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';

type WallhavenPurityState = '1' | '0';
export type WallhavenPurity =
  | `${WallhavenPurityState}${WallhavenPurityState}${WallhavenPurityState}`
  | WallhavenPurityState;

export const WallhavenSearchColors = [
  '660000',
  '990000',
  'cc0000',
  'cc3333',
  'ea4c88',
  '993399',
  '663399',
  '333399',
  '0066cc',
  '0099cc',
  '66cccc',
  '77cc33',
  '669900',
  '336600',
  '666600',
  '999900',
  'cccc33',
  'ffff00',
  'ffcc33',
  'ff9900',
  'ff6600',
  'cc6633',
  '996633',
  '663300',
  '000000',
  '999999',
  'cccccc',
  'ffffff',
  '424153',
] as const;

export type WallhavenSearchColor = (typeof WallhavenSearchColors)[number];

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.searchTerms = useObservable(initial.searchTerms || '');
    this.apiKey = useObservable(initial.apiKey || '');
    this.colors = useObservable(initial.colors || []);
    this.purity = useObservable(initial.purity || '100');
    this.updateInterval = useObservable(initial.updateInterval || 60);
  }

  readonly searchTerms: Observable<string>;
  readonly apiKey: Observable<string>;
  readonly colors: Observable<WallhavenSearchColor[]>;
  readonly purity: Observable<WallhavenPurity>;
  readonly updateInterval: Observable<number>;
}
