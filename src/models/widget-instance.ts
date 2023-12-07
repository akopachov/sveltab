import { WidgetSettings, WidgetSettingsExtra, type WidgetSettingsExtraInitial, type WidgetSettingsInitial } from "./widget-settings";
import { WidgetsCatalog, type WidgetCatalogItem, type WidgetCatalogItemComponents } from '$stores/widgets-catalog';


const WidgetsCatalogIndex = new Map<string, WidgetCatalogItem>(
  WidgetsCatalog.map(c => [c.settings.type, c])  
);

export class WidgetInstance {
  static #lastId = 0;
  private constructor(catalogItem: WidgetCatalogItem, settings: WidgetSettingsInitial, extraConstructor: (new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra)) { 
    this.id = WidgetInstance.#lastId++;
    this.settings = new WidgetSettings(settings, extraConstructor);
    this.components = catalogItem.components;
  }

  static async create(settings: WidgetSettingsInitial) {
    const catalogItem = WidgetsCatalogIndex.get(settings.type);
    if (!catalogItem) {
      throw new Error(`Unknown widget type "${settings.type}"`);
    }
    const extra = await catalogItem.components.settings.model.getValue();
    return new WidgetInstance(catalogItem, settings, extra);
  }

  readonly id: number;
  readonly components: WidgetCatalogItemComponents;
  readonly settings: WidgetSettings;
}
