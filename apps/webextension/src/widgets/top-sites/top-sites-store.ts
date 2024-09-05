import type { TopSites } from 'webextension-polyfill';

let module;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  if (import.meta.env.VITE_TARGET_BROWSER === 'firefox') {
    module = Promise.resolve(browser.topSites);
  } else {
    module = import('webextension-polyfill').then(b => b.default.topSites);
  }
} else {
  module = Promise.resolve({
    get(): Promise<MostVisitedURL[]> {
      return Promise.resolve([
        {
          url: 'https://duckduckgo.com',
          title: 'DuckDuckGo',
        },
        {
          url: 'https://www.mozilla.org',
        },
      ]);
    },
  });
}

export const topSites = await module;
export type MostVisitedURL = TopSites.MostVisitedURL;
