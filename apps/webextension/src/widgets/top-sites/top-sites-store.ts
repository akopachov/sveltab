import type { TopSites } from 'webextension-polyfill';

let $$provider: TopSites.Static | null = null;

async function usePolyfill() {
  $$provider = {
    get(): Promise<TopSites.MostVisitedURL[]> {
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
  };
}

async function useWebExt() {
  $$provider = (await import('webextension-polyfill')).default.topSites;
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

export const topSites = $$provider!;
export type MostVisitedURL = TopSites.MostVisitedURL;
