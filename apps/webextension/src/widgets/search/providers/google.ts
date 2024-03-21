import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import type { SearchProvider } from './search-provider';

export class GoogleSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(searchTerm)}`,
    );
    const response = await fetch(url).then(r => r.json());
    return response[1];
  }
  readonly iconClass = 'icon-[logos--google-icon]';
  readonly name = 'Google';
}
