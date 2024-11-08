import type {
  WidgetMeasurementUnits,
  WidgetPositionInitial,
  WidgetSettingsExtra,
  WidgetSettingsExtraInitial,
  WidgetSettingsInitial,
} from '$lib/widget-settings';
import type { Component } from 'svelte';
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

export type WidgetComponentProps = {
  settings: any;
  id?: string;
  onautosettingsupdate: (id: string, settings: WidgetSettingsExtra) => void;
};

export type WidgetSettingsComponentProps = {
  settings: any;
  tab: number;
  tabs: object[];
};

export type WidgetComponentExports = {
  onDelete?: () => void | Promise<void>;
  overrideBorder?: boolean;
};

export interface WidgetCatalogItemComponents {
  readonly widget: LazyLike<Promise<Component<WidgetComponentProps, WidgetComponentExports>>>;
  readonly preview: LazyLike<Promise<Component>>;
  readonly settings: {
    readonly component: LazyLike<Promise<Component<WidgetSettingsComponentProps>>>;
    readonly model: LazyLike<Promise<new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra>>;
  };
}
