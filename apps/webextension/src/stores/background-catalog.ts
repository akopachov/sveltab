import type { ComponentType, SvelteComponent } from 'svelte';
import type { LazyLike } from '$lib/lazy';
import {
  BackgroundSettingsExtra,
  type BackgroundSettingsExtraInitial,
  type BackgroundSettingsInitial,
} from '$lib/background-settings';
import { Background as StaticColorBackground } from '../backgrounds/static-color';
import { Background as RandomColorBackground } from '../backgrounds/random-color';
import { Background as StaticImageBackground } from '../backgrounds/static-image';
import { Background as RandomImageBackground } from '../backgrounds/random-image';
import { Background as BingDailyImageBackground } from '../backgrounds/bing-daily-image';
import { Background as AnimeImageBackground } from '../backgrounds/anime-image';
import { Background as NasaApodBackground } from '../backgrounds/nasa-apod';
import { Background as PexelsBackground } from '../backgrounds/pexels';
import { Background as WikimediaCommonsPodBackground } from '../backgrounds/wikimedia-commons-pod';
import { Background as WallhavenBackground } from '../backgrounds/wallhaven';

export type CatalogBackgroundSettingsInitial = BackgroundSettingsInitial;

export abstract class BackgroundProvider<T extends BackgroundSettingsExtra> extends EventTarget {
  constructor(node: HTMLElement, settings: T) {
    super();
    this.node = node;
    this.settings = settings;
  }

  protected node: HTMLElement;
  protected settings: T;

  abstract apply(abortSignal: AbortSignal): void;
  abstract forceUpdate(abortSignal: AbortSignal): void;
  abstract destroy(): void;
}

export interface BackgroundCatalogItem {
  readonly name: () => string;
  readonly settings: CatalogBackgroundSettingsInitial;
  readonly components: BackgroundCatalogItemComponents;
}

export interface BackgroundCatalogItemComponents {
  readonly provider: LazyLike<Promise<new (node: HTMLElement, settings: any) => BackgroundProvider<any>>>;
  readonly settings: {
    readonly component: LazyLike<Promise<ComponentType<SvelteComponent>>>;
    readonly model: LazyLike<Promise<new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra>>;
  };
}

export const BackgroundCatalog: Readonly<BackgroundCatalogItem[]> = [
  StaticColorBackground,
  RandomColorBackground,
  StaticImageBackground,
  RandomImageBackground,
  BingDailyImageBackground,
  AnimeImageBackground,
  NasaApodBackground,
  PexelsBackground,
  WikimediaCommonsPodBackground,
  WallhavenBackground,
];
