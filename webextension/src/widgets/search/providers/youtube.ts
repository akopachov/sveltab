import { getCorsFriendlyUrl } from '$lib/cors-bypass';
import type { SearchProvider, SearchSuggestionProvider } from './search-provider';

export class YouTubeSearchProvider implements SearchProvider, SearchSuggestionProvider {
  searchUrl(searchTerm: string) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
  }
  adaptSuggestions(response: any) {
    return response[1];
  }
  suggestionUrl(searchTerm: string) {
    return getCorsFriendlyUrl(
      `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=chrome&q=${encodeURIComponent(
        searchTerm,
      )}`,
    );
  }
  readonly iconClass = 'icon-[logos--youtube-icon]';
  readonly name = 'YouTube';
}
