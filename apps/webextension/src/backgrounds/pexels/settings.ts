import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.searchTerms = useObservable(initial.searchTerms || '');
    this.updateInterval = useObservable(initial.updateInterval || 60);
  }

  readonly searchTerms: Observable<string>;
  readonly updateInterval: Observable<number>;
}
