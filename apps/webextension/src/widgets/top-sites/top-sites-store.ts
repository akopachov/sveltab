let $$provider: typeof browser.topSites | null = null;

if (import.meta.env.VITE_BUILD_FOR === 'webextension' && !import.meta.env.SSR) {
  $$provider = browser.topSites;
} else {
  $$provider = {
    get(): Promise<browser.topSites.MostVisitedURL[]> {
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

export const topSites = $$provider!;
export type MostVisitedURL = browser.topSites.MostVisitedURL;
