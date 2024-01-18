import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class DuckDuckGoSearchProvider implements SearchProvider, SearchSuggestionProvider {
  searchUrl(searchTerm: string) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return getCorsFriendlyUrl(`https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(searchTerm)}&kl=wt-wt&type=list`);
  }
  readonly iconClass = 'icon-[logos--duckduckgo]';
  readonly name = 'DuckDuckGo';
}
