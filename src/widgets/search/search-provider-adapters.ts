import type { SearchProvider } from './settings';

export type SearchProviderAdapter = {
  searchUrl: (searchTerm: string) => string;
  suggestionUrl: (searchTerm: string) => string;
  adaptSuggestions: (response: any) => string[];
};

export const SearchProviderAdapters = new Map<SearchProvider, SearchProviderAdapter>([
  [
    'duckduckgo',
    {
      searchUrl(searchTerm: string) {
        return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`;
      },
      adaptSuggestions(response) {
        return response[1];
      },
      suggestionUrl(searchTerm) {
        return `https://cors-bypass.kopachov.workers.dev/?https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(
          searchTerm,
        )}&type=list`;
      },
    },
  ],
  [
    'google',
    {
      searchUrl(searchTerm: string) {
        return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
      },
      adaptSuggestions(response: any) {
        return response[1];
      },
      suggestionUrl(searchTerm: string) {
        return `https://cors-bypass.kopachov.workers.dev/?https://suggestqueries.google.com/complete/search?client=chrome-omni&q=${encodeURIComponent(
          searchTerm,
        )}`;
      },
    },
  ],
  [
    'bing',
    {
      searchUrl(searchTerm: string) {
        return `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`;
      },
      adaptSuggestions(response: any) {
        return response.suggestionGroups[0].searchSuggestions.map((x: any) => x.displayText);
      },
      suggestionUrl(searchTerm: string) {
        return `https://www.bingapis.com/api/v7/suggestions?appid=6D0A9B8C5100E9ECC7E11A104ADD76C10219804B&q=${encodeURIComponent(
          searchTerm,
        )}`;
      },
    },
  ],
]);
