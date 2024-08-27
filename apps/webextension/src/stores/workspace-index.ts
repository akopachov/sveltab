import { browser } from '$app/environment';
import { logger } from '$lib/logger';
import { WidgetMeasurementUnits } from '$lib/widget-settings';
import { WorkspaceInstance } from '$lib/workspace-instance';
import type { WorkspaceSettingsInitial } from '$lib/workspace-settings';
import { storage } from './storage';

const log = logger.getSubLogger({ prefix: ['Stores', 'Workspace Index'] });

const workspaceIndexStorageKey = 'workspaces';
const defaultWorkspaceId = 'default';

export type WorkspaceInfo = { id: string; name: string };

function getStorageKey(id: string) {
  return `workspace_${id}`;
}

export class WorkspaceIndex {
  #entries: WorkspaceInfo[];
  #defaultWorkspaceId: string;
  constructor(defaultWorkspaceId: string, entries: WorkspaceInfo[]) {
    this.#defaultWorkspaceId = defaultWorkspaceId;
    this.#entries = entries;
  }

  get entries(): ReadonlyArray<WorkspaceInfo> {
    return this.#entries;
  }

  async getInitialSettings(id: string) {
    const storageKey = getStorageKey(id);
    let storageRecord: WorkspaceSettingsInitial | undefined;
    try {
      storageRecord = <WorkspaceSettingsInitial>(await storage.local.get(storageKey))[storageKey];
    } catch (e) {
      log.warn('An error occurred during loading workspace settings', { id }, e);
    }

    if (!storageRecord) {
      const defaultWorkspace: WorkspaceSettingsInitial = (await import('$lib/assets/default_workspace.json').then(
        p => p.default,
      )) as any;
      for (const widget of defaultWorkspace.widgets!) {
        if (widget.position!.sizeUnits === WidgetMeasurementUnits.Fixed) {
          if (widget.position!.width! > document.documentElement.offsetWidth - 10) {
            widget.position!.width = document.documentElement.offsetWidth - 10;
          }

          if (widget.position!.height! > document.documentElement.offsetHeight - 10) {
            widget.position!.height = document.documentElement.offsetHeight - 10;
          }
        }
      }
      storageRecord = defaultWorkspace;
    }

    return storageRecord!;
  }

  async get(id: string) {
    const settings = await this.getInitialSettings(id);
    const workspace = await WorkspaceInstance.create(settings);
    workspace.background.value.components.settings.model.preHeat();
    workspace.background.value.components.provider.preHeat();
    workspace.widgets.value.forEach(w => {
      w.components.settings.model.preHeat();
      w.components.widget.preHeat();
    });
    return workspace;
  }

  async getDefault() {
    return { id: this.#defaultWorkspaceId, workspace: await this.get(this.#defaultWorkspaceId) };
  }

  async #updateIndex(updater: (index: WorkspaceInfo[]) => WorkspaceInfo[]) {
    this.#entries = updater(this.#entries);
    if (browser) {
      await storage.local.set({
        [workspaceIndexStorageKey]: { default: this.#defaultWorkspaceId, entries: this.#entries },
      });
    }
  }

  async save(id: string, workspace: WorkspaceInstance | WorkspaceSettingsInitial) {
    const storageKey = getStorageKey(id);
    await this.#updateIndex(index => {
      const item = index.find(wi => wi.id === id);
      const workspaceName = (workspace instanceof WorkspaceInstance ? workspace.name.value : workspace.name) || '';
      if (!item) {
        index.push({ id: id, name: workspaceName });
      } else {
        item.name = workspaceName;
      }

      return index;
    });
    if (browser) {
      if (workspace instanceof WorkspaceInstance) {
        await workspace.commit(data => storage.local.set({ [storageKey]: data }));
      } else {
        await storage.local.set({ [storageKey]: workspace });
      }
    }
  }

  async delete(...id: string[]) {
    const storageKeys = id.map(m => getStorageKey(m));
    await this.#updateIndex(index => index.filter(f => !id.includes(f.id)));
    await storage.local.remove(storageKeys);
  }

  async wipeAll() {
    await storage.local.clear();
  }

  async setDefault(id: string) {
    this.#defaultWorkspaceId = id;
    await this.#updateIndex(i => i);
  }

  static async create() {
    let indexData: { default: string; entries: WorkspaceInfo[] } | undefined;
    if (browser) {
      try {
        indexData = <any>(await storage.local.get(workspaceIndexStorageKey))[workspaceIndexStorageKey];
      } catch (e) {
        log.warn('An error occurred during loading workspaces info list', e);
      }
    }

    return new WorkspaceIndex(
      indexData?.default || defaultWorkspaceId,
      indexData?.entries || [{ id: defaultWorkspaceId, name: 'Default' }],
    );
  }
}

export const Workspaces = await WorkspaceIndex.create();
