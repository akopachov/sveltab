import { Lazy } from '$lib/lazy';
import type { SearchProviderAdapter } from '../search-provider-adapter';

export class GoogleSearchProviderAdapter implements SearchProviderAdapter {
  searchUrl(searchTerm: string) {
    return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return `https://cors-bypass.kopachov.workers.dev/?https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
      searchTerm,
    )}`;
  }
  readonly icon: Lazy<Promise<string>> = new Lazy(() => import('./icon.svg?raw').then(r => r.default));
}
