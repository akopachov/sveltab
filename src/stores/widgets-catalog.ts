import type {
  WidgetPositionInitial,
  WidgetSettingsExtra,
  WidgetSettingsExtraInitial,
  WidgetSettingsInitial,
} from '$models/widget-settings';
import type { ComponentType, SvelteComponent } from 'svelte';
import type { Lazy } from '$lib/lazy';
import { Widget as ClockWidget } from '$widgets/clock';
import { Widget as DateWidget } from '$widgets/date';
import { Widget as RandomQuoteWidget } from '$widgets/quote';
import { Widget as SearchWidget } from '$widgets/search';
import { Widget as GreetingWidget } from '$widgets/greeting';
import { Widget as FlickrWidget } from '$widgets/flickr-image';
import { Widget as LinkWidget } from '$widgets/link';

export type CatalogWidgetSettingsInitial = Omit<WidgetSettingsInitial, 'position'> & {
  position: Omit<WidgetPositionInitial, 'x' | 'y'>;
};

export interface WidgetCatalogItem {
  readonly name: () => string;
  readonly previewImage: Lazy<Promise<string>>;
  readonly settings: CatalogWidgetSettingsInitial;
  readonly components: WidgetCatalogItemComponents;
}

export interface WidgetCatalogItemComponents {
  readonly widget: Lazy<Promise<ComponentType<SvelteComponent>>>;
  readonly settings: {
    readonly tabs: Lazy<Promise<{ id: number | string; title: () => string }[]>>;
    readonly component: Lazy<Promise<ComponentType<SvelteComponent>>>;
    readonly model: Lazy<Promise<new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra>>;
  };
}

export const WidgetsCatalog: Readonly<WidgetCatalogItem[]> = [
  ClockWidget,
  DateWidget,
  LinkWidget,
  SearchWidget,
  GreetingWidget,
  RandomQuoteWidget,
  FlickrWidget,
];
