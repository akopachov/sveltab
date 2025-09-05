import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import type { SearchProvider } from './search-provider';

export class WikipediaSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://wikipedia.org/w/index.php?search=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(
      `https://wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&gpslimit=6&gpsnamespace=0&gpssearch=${encodeURIComponent(searchTerm)}&pilimit=6&piprop=thumbnail&pithumbsize=75&ppprop=displaytitle&prop=pageprops|pageimages|description&redirects=`,
    );
    const response = await fetch(url).then(r => r.json());
    return Object.values(response.query?.pages ?? {})
      .map((p: any) => p.title)
      .filter(Boolean);
  }
  readonly iconClass = 'icon-[mdi--wikipedia]';
}
