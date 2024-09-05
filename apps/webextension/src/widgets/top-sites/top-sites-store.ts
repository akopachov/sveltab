import type { TopSites } from 'webextension-polyfill';

let module;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  module = import('webextension-polyfill');
} else {
  module = Promise.resolve({
    default: {
      topSites: {
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
      },
    },
  });
}

export const topSites = (await module).default.topSites;
export type MostVisitedURL = TopSites.MostVisitedURL;
