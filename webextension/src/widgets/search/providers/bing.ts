import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import type { SearchProvider } from './search-provider';

export class BingSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(searchTerm)}`);
    const response = await fetch(url).then(r => r.json());
    return response[1];
  }
  readonly iconClass = 'icon-[logos--bing]';
  readonly name = 'Bing';
}
