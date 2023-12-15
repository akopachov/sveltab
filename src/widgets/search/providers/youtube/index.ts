import { Lazy } from '$lib/lazy';
import type { SearchProviderAdapter } from '../search-provider-adapter';

export class YouTubeSearchProviderAdapter implements SearchProviderAdapter {
  searchUrl(searchTerm: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return `https://cors-bypass.kopachov.workers.dev/?http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=chrome&q=${encodeURIComponent(
      searchTerm,
    )}`;
  }
  readonly icon: Lazy<Promise<string>> = new Lazy(() => import('./icon.svg?raw').then(r => r.default));
}
