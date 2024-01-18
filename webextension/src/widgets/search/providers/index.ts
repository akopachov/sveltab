import type { SearchProviderName } from '../settings';
import { BingSearchProvider } from './bing';
import { DuckDuckGoSearchProvider } from './duckduckgo';
import { GenericSuggestionlessProvider } from './generic-suggestionless';
import { GoogleSearchProvider } from './google';
import type { SearchProvider } from './search-provider';
import { YouTubeSearchProvider } from './youtube';

export const SearchProviders = new Map<SearchProviderName, SearchProvider>([
  ['duckduckgo', new DuckDuckGoSearchProvider()],
  ['google', new GoogleSearchProvider()],
  ['bing', new BingSearchProvider()],
  ['youtube', new YouTubeSearchProvider()],
  [
    'brave',
    new GenericSuggestionlessProvider(
      'Brave',
      'https://search.brave.com/search?q={searchTerms}',
      'icon-[logos--brave]',
    ),
  ],
]);
