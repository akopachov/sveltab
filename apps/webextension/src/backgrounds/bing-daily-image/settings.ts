import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';
import type { BingSupportedMarkets } from './types';

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.locale = useObservable(initial.locale || 'random');
  }

  readonly locale: Observable<BingSupportedMarkets | 'random'>;
}
