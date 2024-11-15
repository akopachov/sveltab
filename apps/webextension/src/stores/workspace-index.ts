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
  #entries: WorkspaceInfo[] | Promise<WorkspaceInfo[]>;
  #defaultWorkspaceId: string | Promise<string>;
  constructor() {
    if (browser) {
      const indexDataPromise = storage.local
        .get(workspaceIndexStorageKey)
        .then<{ default: string; entries: WorkspaceInfo[] } | undefined>(
          data => data[workspaceIndexStorageKey],
          e => {
            log.warn('An error occurred during loading workspaces info list', e);
            return e;
          },
        );
      this.#defaultWorkspaceId = indexDataPromise.then(data => data?.default || defaultWorkspaceId);
      this.#entries = indexDataPromise.then(data => data?.entries || [{ id: defaultWorkspaceId, name: 'Default' }]);
    } else {
      this.#defaultWorkspaceId = defaultWorkspaceId;
      this.#entries = [{ id: defaultWorkspaceId, name: 'Default' }];
    }
  }

  get entries(): Promise<ReadonlyArray<WorkspaceInfo>> | ReadonlyArray<WorkspaceInfo> {
    return this.#entries;
  }

  async getInitialSettings(id: string) {
    const storageKey = getStorageKey(id);
    let storageRecord: WorkspaceSettingsInitial | undefined;
    let usedDefaultWorkspace: boolean = false;
    try {
      storageRecord = <WorkspaceSettingsInitial>(await storage.local.get(storageKey))[storageKey];
    } catch (e) {
      log.warn('An error occurred during loading workspace settings', { id }, e);
    }

    if (!storageRecord) {
      usedDefaultWorkspace = true;
      const defaultWorkspace: WorkspaceSettingsInitial = await import('$lib/assets/default_workspace.json').then<any>(
        p => p.default,
      );
      setTimeout(() => {
        for (const widget of defaultWorkspace.widgets!) {
          if (widget.position!.positionUnits === WidgetMeasurementUnits.Fixed) {
            if (widget.position!.x! >= document.documentElement.offsetWidth) {
              widget.position!.x = 0;
            }

            if (widget.position!.y! >= document.documentElement.offsetHeight) {
              widget.position!.y = 0;
            }
          }

          if (widget.position!.sizeUnits === WidgetMeasurementUnits.Fixed) {
            if (widget.position!.width! > document.documentElement.offsetWidth - 10) {
              widget.position!.width = document.documentElement.offsetWidth - 10;
            }

            if (widget.position!.height! > document.documentElement.offsetHeight - 10) {
              widget.position!.height = document.documentElement.offsetHeight - 10;
            }
          }
        }
      }, 500);

      storageRecord = defaultWorkspace;
    }

    return { settings: storageRecord!, usedDefault: usedDefaultWorkspace };
  }

  async get(id: string) {
    const { settings, usedDefault } = await this.getInitialSettings(id);
    const workspace = await WorkspaceInstance.create(settings, usedDefault);
    workspace.background.value.components.settings.model.preHeat();
    workspace.background.value.components.provider.preHeat();
    workspace.widgets.forEach(w => {
      w.components.settings.model.preHeat();
      w.components.widget.preHeat();
    });
    return workspace;
  }

  async getDefault() {
    if (this.#defaultWorkspaceId instanceof Promise) {
      this.#defaultWorkspaceId = await this.#defaultWorkspaceId;
    }
    return { id: this.#defaultWorkspaceId, workspace: await this.get(this.#defaultWorkspaceId) };
  }

  async #updateIndex(updater: (index: WorkspaceInfo[]) => WorkspaceInfo[]) {
    if (this.#entries instanceof Promise) {
      this.#entries = await this.#entries;
    }
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
        await workspace.commit(async data => await storage.local.set({ [storageKey]: data }));
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
}

export const Workspaces = new WorkspaceIndex();
