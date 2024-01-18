import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider } from './search-provider';

export class BraveSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://search.brave.com/search?q=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(
      `https://search.brave.com/api/suggest?q=${encodeURIComponent(searchTerm)}&rich=true&source=web`,
    );
    const response = await fetch(url).then(r => r.json());
    return response[1].map((m: any) => m.q);
  }
  readonly iconClass = 'icon-[logos--brave]';
  readonly name = 'Brave';
}
