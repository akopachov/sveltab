import type { Storage } from 'webextension-polyfill';

let storage: Storage.Static | null = null;
export async function getStorage() {
  if (!storage) {
    try {
      storage = (await import('webextension-polyfill')).default.storage;
    } catch {
      storage = (await import('browser-storage-polyfill/index')).default;
    }
  }

  return storage!;
}
