import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';

export enum AnimeTopics {
  Any = 'any',
  YCY = 'ycy',
  MOEZ = 'moez',
  AI = 'ai',
  OriginalGod = 'ysz',
  PCTransverse = 'pc',
  MOE = 'moe',
  Landscape = 'fj',
  BD = 'bd',
  Genshin = 'ys',
  MP = 'mp',
  MOEMP = 'moemp',
  YSMP = 'ysmp',
  AIMP = 'aimp',
  LAI = 'lai',
  XHL = 'xhl',
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
