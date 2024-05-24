import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable';

export enum AnimeTopics {
  Any = 'any',
  ACG = 'ycy',
  MOE = 'moez',
  AI = 'ai',
  OriginalGod = 'ysz',
  PCTransverse = 'pc',
  Landscape = 'fj',
  Genshin = 'ys',
}

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.topic = useObservable(initial.topic || AnimeTopics.Any);
    this.updateInterval = useObservable(initial.updateInterval || 60);
  }

  readonly topic: Observable<AnimeTopics>;
  readonly updateInterval: Observable<number>;
}
