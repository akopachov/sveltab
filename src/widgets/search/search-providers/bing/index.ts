import { Lazy } from '$lib/lazy';
import type { SearchProviderAdapter } from '../search-provider-adapter';

export class BingSearchProviderAdapter implements SearchProviderAdapter {
  searchUrl(searchTerm: string) {
    return `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response.suggestionGroups[0].searchSuggestions.map((x: any) => x.displayText);
  }
  suggestionUrl(searchTerm: string) {
    return `https://www.bingapis.com/api/v7/suggestions?appid=6D0A9B8C5100E9ECC7E11A104ADD76C10219804B&q=${encodeURIComponent(
      searchTerm,
    )}`;
  }
  readonly icon: Lazy<Promise<string>> = new Lazy(() => import('./icon.svg?raw').then(r => r.default));
}
