import {
  WidgetSettings,
  WidgetSettingsExtra,
  type WidgetSettingsExtraInitial,
  type WidgetSettingsInitial,
} from './widget-settings';
import { WidgetsCatalog, type WidgetCatalogItem, type WidgetCatalogItemComponents } from '$stores/widgets-catalog';

const WidgetsCatalogIndex = new Map<string, WidgetCatalogItem>(WidgetsCatalog.map(c => [c.settings.type, c]));

export class WidgetInstance {
  private constructor(
    catalogItem: WidgetCatalogItem,
    settings: WidgetSettingsInitial,
    extraConstructor: new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra,
  ) {
    this.settings = new WidgetSettings(settings, extraConstructor);
    this.components = catalogItem.components;
  }

  static async create(settings: WidgetSettingsInitial) {
    const catalogItem = WidgetsCatalogIndex.get(settings.type);
    if (!catalogItem) {
      throw new Error(`Unknown widget type "${settings.type}"`);
    }
    const extra = await catalogItem.components.settings.model.value;
    return new WidgetInstance(catalogItem, settings, extra);
  }

  get id() {
    return this.settings.id;
  }
  get htmlElementId() {
    return `widget_${this.id}`;
  }
  readonly components: WidgetCatalogItemComponents;
  readonly settings: WidgetSettings;
}
