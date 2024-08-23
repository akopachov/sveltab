import type {
  WidgetMeasurementUnits,
  WidgetPositionInitial,
  WidgetSettingsExtra,
  WidgetSettingsExtraInitial,
  WidgetSettingsInitial,
} from '$lib/widget-settings';
import type { ComponentType, SvelteComponent } from 'svelte';
import type { LazyLike } from '$lib/lazy';
import { Widget as ClockWidget } from '$widgets/clock';
import { Widget as DateWidget } from '$widgets/date';
import { Widget as RandomQuoteWidget } from '$widgets/quote';
import { Widget as SearchWidget } from '$widgets/search';
import { Widget as GreetingWidget } from '$widgets/greeting';
import { Widget as FlickrWidget } from '$widgets/flickr-image';
import { Widget as LinkWidget } from '$widgets/link';
import { Widget as WeatherWidget } from '$widgets/weather';
import { Widget as FreeTextWidget } from '$widgets/free-text';
import { Widget as TopSitesWidget } from '$widgets/top-sites';
import { Widget as HtmlWidget } from '$widgets/html';
import { Widget as AnalogueClockWidget } from '$widgets/analogue-clock';
import { Widget as CryptoAssetQuotationWidget } from '$widgets/crypto-assets-quotation';
import { Widget as AirQualityWidget } from '$widgets/air-quality';
import { Widget as IpInfoWidget } from '$widgets/ip-info';
import { Widget as HolidaysWidget } from '$widgets/holidays';
import { Widget as LiteratureClockWidget } from '$widgets/literature-clock';

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
  readonly widget: LazyLike<Promise<ComponentType<SvelteComponent>>>;
  readonly preview: LazyLike<Promise<ComponentType<SvelteComponent>>>;
  readonly settings: {
    readonly tabs: LazyLike<Promise<{ id: number | string; title: () => string }[]>>;
    readonly component: LazyLike<Promise<ComponentType<SvelteComponent>>>;
    readonly model: LazyLike<Promise<new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra>>;
  };
}

export const WidgetsCatalog: Readonly<WidgetCatalogItem[]> = [
  ClockWidget,
  AnalogueClockWidget,
  LiteratureClockWidget,
  DateWidget,
  LinkWidget,
  SearchWidget,
  WeatherWidget,
  AirQualityWidget,
  GreetingWidget,
  RandomQuoteWidget,
  FlickrWidget,
  FreeTextWidget,
  TopSitesWidget,
  HtmlWidget,
  CryptoAssetQuotationWidget,
  IpInfoWidget,
  HolidaysWidget,
];
