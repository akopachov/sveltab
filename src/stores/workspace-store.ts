import { WorkspaceInstance } from '$models/workspace-instance';
import type { WorkspaceSettingsInitial } from '$models/workspace-settings';
import { getStorage } from './storage';

function getStorageKey(id: string) {
  return `workspace_${id}`;
}

export async function getWorkspace(id: string) {
  const storage = await getStorage();
  const storageKey = getStorageKey(id);
  let storageRecord: WorkspaceSettingsInitial | undefined;
  try {
    storageRecord = (await storage.local.get(storageKey))[storageKey];
  } catch (e) {
    console.warn('getWorkspace ->', e);
  }

  if (!storageRecord) {
    storageRecord = {};
  }

  return await WorkspaceInstance.create(storageRecord);
}

export async function saveWorkspace(id: string, workspace: WorkspaceInstance) {
  const storage = await getStorage();
  const storageKey = getStorageKey(id);
  await workspace.commit(data => storage.local.set({ [storageKey]: data }));
}
