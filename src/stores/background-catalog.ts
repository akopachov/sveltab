import type { ComponentType, SvelteComponent } from 'svelte';
import type { Lazy } from '$lib/lazy';
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

export type CatalogBackgroundSettingsInitial = BackgroundSettingsInitial;

export abstract class BackgroundProvider<T extends BackgroundSettingsExtra> extends EventTarget {
  constructor(node: HTMLElement, settings: T) {
    super();
    this.node = node;
    this.settings = settings;
  }

  protected node: HTMLElement;
  protected settings: T;

  abstract apply(): void;
  abstract forceUpdate(): void;
  abstract destroy(): void;
}

export interface BackgroundCatalogItem {
  readonly name: () => string;
  readonly settings: CatalogBackgroundSettingsInitial;
  readonly components: BackgroundCatalogItemComponents;
}

export interface BackgroundCatalogItemComponents {
  readonly provider: Lazy<Promise<new (node: HTMLElement, settings: any) => BackgroundProvider<any>>>;
  readonly settings: {
    readonly component: Lazy<Promise<ComponentType<SvelteComponent>>>;
    readonly model: Lazy<Promise<new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra>>;
  };
}

export const BackgroundCatalog: Readonly<BackgroundCatalogItem[]> = [
  StaticColorBackground,
  RandomColorBackground,
  StaticImageBackground,
  RandomImageBackground,
  BingDailyImageBackground,
];
