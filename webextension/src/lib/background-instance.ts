import {
  BackgroundCatalog,
  type BackgroundCatalogItem,
  type BackgroundCatalogItemComponents,
} from '$stores/background-catalog';
import {
  BackgroundSettings,
  type BackgroundSettingsExtra,
  type BackgroundSettingsExtraInitial,
  type BackgroundSettingsInitial,
} from './background-settings';

const BackgroundCatalogIndex = new Map<string, BackgroundCatalogItem>(BackgroundCatalog.map(c => [c.settings.type, c]));

export class BackgroundInstance {
  private constructor(
    catalogItem: BackgroundCatalogItem,
    settings: BackgroundSettingsInitial,
    extraConstructor: new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra,
  ) {
    this.settings = new BackgroundSettings(settings, extraConstructor);
    this.components = catalogItem.components;
  }

  static async create(settings: BackgroundSettingsInitial) {
    const catalogItem = BackgroundCatalogIndex.get(settings.type);
    if (!catalogItem) {
      throw new Error(`Unknown background type "${settings.type}"`);
    }
    const extra = await catalogItem.components.settings.model.getValue();
    return new BackgroundInstance(catalogItem, settings, extra);
  }

  readonly components: BackgroundCatalogItemComponents;
  readonly settings: BackgroundSettings;
}
