import type { Storage } from 'webextension-polyfill';

let $$storage: Storage.Static | null = null;

async function usePolyfill() {
  const { setStorage, getStorage, removeStorage, clearStorage } = await import(
    'browser-storage-polyfill/src/helpers/index'
  );
  const polyFillStorage = {
    set: setStorage,
    get: getStorage,
    remove: removeStorage,
    clear: clearStorage,
  };
  $$storage = <any>{
    local: polyFillStorage,
    session: polyFillStorage,
    sync: polyFillStorage,
  };
}

async function useWebExt() {
  $$storage = (await import('webextension-polyfill')).default.storage;
}

if (import.meta.env.DEV || import.meta.env.SSR) {
  await usePolyfill();
} else {
  try {
    await useWebExt();
  } catch {
    await usePolyfill();
  }
}

export const storage = $$storage!;
