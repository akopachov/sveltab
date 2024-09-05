let $$storage: typeof browser.storage | null = null;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  $$storage = browser.storage;
} else {
  $$storage = <typeof browser.storage>(await import('browser-storage-polyfill/index')).default;
}

export const storage = $$storage!;
