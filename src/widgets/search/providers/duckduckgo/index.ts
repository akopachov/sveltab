import { getCorsFriendlyUrl } from '$lib/cors-bypass';
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
    return getCorsFriendlyUrl(`https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(searchTerm)}&kl=wt-wt&type=list`);
  }
  readonly icon: Lazy<Promise<string>> = new Lazy(() => import('./icon.svg?raw').then(r => r.default));
}
