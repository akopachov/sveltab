let module;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  if (import.meta.env.VITE_TARGET_BROWSER === 'firefox') {
    module = Promise.resolve(browser.storage);
  } else {
    module = import('webextension-polyfill').then(b => b.default.storage);
  }
} else {
  module = import('browser-storage-polyfill/index').then(b => b.default);
}

export const storage = await module;
