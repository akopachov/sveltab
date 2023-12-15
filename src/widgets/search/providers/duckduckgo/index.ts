import { Lazy } from '$lib/lazy';
import type { SearchProviderAdapter } from '../search-provider-adapter';

export class DuckDuckGoSearchProviderAdapter implements SearchProviderAdapter {
  searchUrl(searchTerm: string) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return `https://cors-bypass.kopachov.workers.dev/?https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(
      searchTerm,
    )}&type=list`;
  }
  readonly icon: Lazy<Promise<string>> = new Lazy(() => import('./icon.svg?raw').then(r => r.default));
}
