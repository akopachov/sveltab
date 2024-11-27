import type { Settings } from '../settings';
import type { SearchProvider } from './search-provider';

const EmptySuggestionsPromise = Promise.resolve([]);
export class CustomSearchProvider implements SearchProvider {
  #settings: Settings;

  constructor(settings: Settings) {
    this.#settings = settings;
  }

  searchUrl(searchTerm: string) {
    const url = this.#settings.customSearchProviderSearchUrl.value;
    return url.replace('{query}', encodeURIComponent(searchTerm));
  }

  getSuggestion() {
    return EmptySuggestionsPromise;
  }
  readonly iconClass = 'icon-[material-symbols--search]';
}
