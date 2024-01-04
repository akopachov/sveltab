import type { Storage } from 'webextension-polyfill';

let $$storage: Storage.Static | null = null;

async function usePolyfill() {
  $$storage = <Storage.Static>(await import('browser-storage-polyfill/index')).default;
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

export const storage = $$storage;
