import type {
  WidgetMeasurementUnits,
  WidgetPositionInitial,
  WidgetSettingsExtra,
  WidgetSettingsExtraInitial,
  WidgetSettingsInitial,
} from '$lib/widget-settings';
import type { ComponentType, SvelteComponent } from 'svelte';
import type { LazyLike } from '$lib/lazy';

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
    readonly component: LazyLike<Promise<ComponentType<SvelteComponent>>>;
    readonly model: LazyLike<Promise<new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra>>;
  };
}
