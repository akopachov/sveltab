import type { WidgetCatalogItem } from './types';
import { Widget as ClockWidget } from './clock';
import { Widget as DateWidget } from './date';
// import { Widget as RandomQuoteWidget } from './quote';
// import { Widget as SearchWidget } from './search';
import { Widget as GreetingWidget } from './greeting';
import { Widget as FlickrWidget } from './flickr-image';
// import { Widget as LinkWidget } from './link';
// import { Widget as WeatherWidget } from './weather';
import { Widget as FreeTextWidget } from './free-text';
// import { Widget as TopSitesWidget } from './top-sites';
import { Widget as HtmlWidget } from './html';
import { Widget as AnalogueClockWidget } from './analogue-clock';
import { Widget as CryptoAssetQuotationWidget } from './crypto-assets-quotation';
import { Widget as AirQualityWidget } from './air-quality';
import { Widget as IpInfoWidget } from './ip-info';
import { Widget as HolidaysWidget } from './holidays';
// import { Widget as LiteratureClockWidget } from './literature-clock';

export const Widgets: ReadonlyArray<WidgetCatalogItem> = [
  ClockWidget,
  AnalogueClockWidget,
  // LiteratureClockWidget,
  DateWidget,
  // LinkWidget,
  // SearchWidget,
  // WeatherWidget,
  AirQualityWidget,
  GreetingWidget,
  // RandomQuoteWidget,
  FlickrWidget,
  FreeTextWidget,
  // TopSitesWidget,
  HtmlWidget,
  CryptoAssetQuotationWidget,
  IpInfoWidget,
  HolidaysWidget,
];
