import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import type { SearchProvider } from './search-provider';

export class DuckDuckGoSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(
      `https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(searchTerm)}&kl=wt-wt&type=list`,
    );
    const response = await fetch(url).then(r => r.json());
    return response[1];
  }
  readonly iconClass = 'icon-[logos--duckduckgo]';
  readonly name = 'DuckDuckGo';
}
