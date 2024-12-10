let module;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  if (import.meta.env.VITE_TARGET_BROWSER === 'firefox') {
    module = Promise.resolve(browser.topSites);
  } else {
    module = import('webextension-polyfill').then(b => b.default.topSites);
  }
} else {
  module = Promise.resolve({
    get(): ReturnType<typeof browser.topSites.get> {
      return Promise.resolve([
        {
          url: 'https://duckduckgo.com',
          title: 'DuckDuckGo',
        },
        {
          url: 'https://www.mozilla.org',
          title: 'Mozilla',
        },
        {
          url: 'https://github.com',
          title: 'GitHub',
        },
      ]);
    },
  });
}

export const topSites = await module;
