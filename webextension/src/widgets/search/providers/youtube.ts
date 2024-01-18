import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider } from './search-provider';

export class YouTubeSearchProvider implements SearchProvider {
  searchUrl(searchTerm: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
  }
  async getSuggestion(searchTerm: string) {
    const url = getCorsFriendlyUrl(
      `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=chrome&q=${encodeURIComponent(
        searchTerm,
      )}`,
    );
    const response = await fetch(url).then(r => r.json());
    return response[1];
  }
  readonly iconClass = 'icon-[logos--youtube-icon]';
  readonly name = 'YouTube';
}
