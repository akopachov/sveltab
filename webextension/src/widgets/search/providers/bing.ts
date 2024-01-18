import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class BingSearchProvider implements SearchProvider, SearchSuggestionProvider {
  searchUrl(searchTerm: string) {
    return `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return getCorsFriendlyUrl(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(searchTerm)}`);
  }
  readonly iconClass = 'icon-[logos--bing]';
  readonly name = 'Bing';
}
