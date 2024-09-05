import type { BackgroundCatalogItem, BackgroundCatalogItemComponents } from '$backgrounds/types';
import { Backgrounds } from '$backgrounds/index';
import {
  BackgroundSettings,
  type BackgroundSettingsExtra,
  type BackgroundSettingsExtraInitial,
  type BackgroundSettingsInitial,
} from './background-settings';
import type { WorkspaceInstance } from './workspace-instance';

const BackgroundIndex = new Map<string, BackgroundCatalogItem>(Backgrounds.map(c => [c.settings.type, c]));

export class BackgroundInstance {
  #onRemove: ((instance: WorkspaceInstance) => Promise<void> | void) | undefined;
  private constructor(
    catalogItem: BackgroundCatalogItem,
    settings: BackgroundSettingsInitial,
    extraConstructor: new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra,
  ) {
    this.settings = new BackgroundSettings(settings, extraConstructor);
    this.components = catalogItem.components;
    this.#onRemove = catalogItem.lifecycle?.onRemove;
  }

  static async create(settings: BackgroundSettingsInitial) {
    let catalogItem = BackgroundIndex.get(settings.type);
    if (!catalogItem) {
      catalogItem = Backgrounds[0];
      settings = { ...catalogItem.settings };
    }
    const extra = await catalogItem.components.settings.model.value;
    return new BackgroundInstance(catalogItem, settings, extra);
  }

  readonly components: BackgroundCatalogItemComponents;
  readonly settings: BackgroundSettings;
  readonly lifecycle = {
    onRemove: async (instance: WorkspaceInstance) => {
      if (this.#onRemove) {
        await this.#onRemove(instance);
      }
    },
  };
}
