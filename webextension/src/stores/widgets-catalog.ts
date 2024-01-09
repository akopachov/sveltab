import type {
  WidgetMeasurementUnits,
  WidgetPositionInitial,
  WidgetSettingsExtra,
  WidgetSettingsExtraInitial,
  WidgetSettingsInitial,
} from '$lib/widget-settings';
import type { ComponentType, SvelteComponent } from 'svelte';
import type { Lazy } from '$lib/lazy';
import { Widget as ClockWidget } from '$widgets/clock';
import { Widget as DateWidget } from '$widgets/date';
import { Widget as RandomQuoteWidget } from '$widgets/quote';
import { Widget as SearchWidget } from '$widgets/search';
import { Widget as GreetingWidget } from '$widgets/greeting';
import { Widget as FlickrWidget } from '$widgets/flickr-image';
import { Widget as LinkWidget } from '$widgets/link';
import { Widget as WeatherWidget } from '$widgets/weather';
import { Widget as FreeTextWidget } from '$widgets/free-text';

export type CatalogWidgetSettingsInitial = Omit<WidgetSettingsInitial, 'position'> & {
  position: Omit<WidgetPositionInitial, 'x' | 'y' | 'positionUnits' | 'sizeUnits'> &
    Required<Pick<WidgetPositionInitial, 'width' | 'height'>> & {
      positionUnits?: WidgetMeasurementUnits.Scale;
      sizeUnits?: WidgetMeasurementUnits.Scale;
    };
};

export interface WidgetCatalogItem {
  readonly name: () => string;
  readonly settings: CatalogWidgetSettingsInitial;
  readonly components: WidgetCatalogItemComponents;
}

export interface WidgetCatalogItemComponents {
  readonly widget: Lazy<Promise<ComponentType<SvelteComponent>>>;
  readonly preview: Lazy<Promise<ComponentType<SvelteComponent>>>;
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
  WeatherWidget,
  GreetingWidget,
  RandomQuoteWidget,
  FlickrWidget,
  FreeTextWidget,
];
