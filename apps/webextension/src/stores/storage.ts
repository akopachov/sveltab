let module;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  module = import('webextension-polyfill');
} else {
  module = import('browser-storage-polyfill/index');
}

export const storage = (await module).default;
