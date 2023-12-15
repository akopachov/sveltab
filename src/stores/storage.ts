import type { Storage } from 'webextension-polyfill';

let $$storage: Storage.Static | null = null;

if (import.meta.env.DEV || import.meta.env.SSR) {
  $$storage = <Storage.Static>(await import('browser-storage-polyfill/index')).default;
} else {
  $$storage = (await import('webextension-polyfill')).default.storage;
}

export const storage = $$storage;
