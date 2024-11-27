import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import type { Settings } from '../settings';
import type { SearchProvider } from './search-provider';

export class SearxSearchProvider implements SearchProvider {
  #settings: Settings;

  constructor(settings: Settings) {
    this.#settings = settings;
  }

  searchUrl(searchTerm: string) {
    const url = new URL(this.#settings.searxBaseUrl.value);
    url.searchParams.set('q', searchTerm);
    return url.toString();
  }

  async getSuggestion(searchTerm: string) {
    const url = new URL('/autocompleter', this.#settings.searxBaseUrl.value);
    url.searchParams.set('q', searchTerm);
    const response = await fetch(getCorsFriendlyUrl(url.toString())).then(r => r.json());
    return response[1];
  }

  readonly iconClass = 'icon-[material-symbols--search]';
}
