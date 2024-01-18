import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class BingSearchProvider implements SearchProvider, SearchSuggestionProvider {
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
  readonly iconClass = 'icon-[logos--bing]';
  readonly name = 'Bing';
}
