import type { WidgetSettingsExtra, WidgetSettingsExtraInitial, WidgetSettingsInitial } from "$models/widget-settings";
import type { ComponentType, SvelteComponent  } from "svelte";
import { Widget as DumbWidget } from "$widgets/dumb";
import { Widget as ClockWidget } from "$widgets/clock";
import type { Lazy } from "$lib/lazy";

export type CatalogWidgetSettingsInitial = Omit<WidgetSettingsInitial, 'x' | 'y'>;

export interface WidgetCatalogItem {
  readonly name: string;
  readonly previewImageUri: string;
  readonly settings: CatalogWidgetSettingsInitial;
  readonly components: WidgetCatalogItemComponents
}

export interface WidgetCatalogItemComponents {
  readonly widget: Lazy<Promise<ComponentType<SvelteComponent>>>;
  readonly settings: { 
    readonly tabs: Lazy<Promise<{id: number | string, title: string}[]>>,
    readonly component: Lazy<Promise<ComponentType<SvelteComponent>>>,
    readonly model: Lazy<Promise<(new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra)>>
  }
}

export const WidgetsCatalog: Readonly<WidgetCatalogItem[]> = [
  DumbWidget,
  ClockWidget
];
