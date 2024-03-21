import { BackgroundSettingsExtra, type BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable';
import type { Filter } from '$stores/active-filters-store';

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

export class Settings extends BackgroundSettingsExtra {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super();
    this.topic = useObservable(initial.topic || AnimeTopics.Any);
    this.updateInterval = useObservable(initial.updateInterval || 60);
    this.blur = useObservable(initial.blur || 0);
    this.filter = useObservable(initial.filter);
  }

  readonly topic: Observable<AnimeTopics>;
  readonly updateInterval: Observable<number>;
  readonly blur: Observable<number>;
  readonly filter: Observable<Filter | undefined>;
}
