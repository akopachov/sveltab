import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class BraveSearchProvider implements SearchProvider, SearchSuggestionProvider {
  searchUrl(searchTerm: string) {
    return `https://search.brave.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1].map((m: any) => m.q);
  }
  suggestionUrl(searchTerm: string) {
    return getCorsFriendlyUrl(
      `https://search.brave.com/api/suggest?q=${encodeURIComponent(searchTerm)}&rich=true&source=web`,
    );
  }
  readonly iconClass = 'icon-[logos--brave]';
  readonly name = 'Brave';
}
