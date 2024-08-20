import type { SearchProvider } from './search-provider';

const EmptySuggestionsPromise = Promise.resolve([]);
export class MetacrawlerSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://www.metacrawler.com/serp?q=${encodeURIComponent(searchTerm)}`;
  }
  getSuggestion() {
    return EmptySuggestionsPromise;
  }
  readonly iconClass = 'icon-[material-symbols--search]';
  readonly name = 'Metacrawler';
}
