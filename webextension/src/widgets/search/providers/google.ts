import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class GoogleSearchProvider implements SearchProvider, SearchSuggestionProvider {
  searchUrl(searchTerm: string) {
    return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return getCorsFriendlyUrl(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(searchTerm)}`,
    );
  }
  readonly iconClass = 'icon-[logos--google-icon]';
  readonly name = 'Google';
}
