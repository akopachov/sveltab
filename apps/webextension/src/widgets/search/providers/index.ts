import type { SearchProviderName } from '../settings';
import { BingSearchProvider } from './bing';
import { BraveSearchProvider } from './brave';
import { DuckDuckGoSearchProvider } from './duckduckgo';
import { GoogleSearchProvider } from './google';
import type { SearchProvider } from './search-provider';
import { YouTubeSearchProvider } from './youtube';
import { MetacrawlerSearchProvider } from './metacrawler';

export const SearchProviders = new Map<SearchProviderName, SearchProvider>([
  ['duckduckgo', new DuckDuckGoSearchProvider()],
  ['google', new GoogleSearchProvider()],
  ['bing', new BingSearchProvider()],
  ['youtube', new YouTubeSearchProvider()],
  ['brave', new BraveSearchProvider()],
  ['metacrawler', new MetacrawlerSearchProvider()],
]);
