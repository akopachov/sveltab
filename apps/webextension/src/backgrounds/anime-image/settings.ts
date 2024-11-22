import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';
import { AnimeTopics } from './api';

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.topic = useObservable(initial.topic || 'any');
    this.updateInterval = useObservable(initial.updateInterval || 60);
  }

  readonly topic: Observable<AnimeTopics | 'any'>;
  readonly updateInterval: Observable<number>;
}
