import type { SearchProvider } from '../settings';
import { BingSearchProviderAdapter } from './bing';
import { DuckDuckGoSearchProviderAdapter } from './duckduckgo';
import { GoogleSearchProviderAdapter } from './google';
import type { SearchProviderAdapter } from './search-provider-adapter';
import { YouTubeSearchProviderAdapter } from './youtube';

export const SearchProviderAdapters = new Map<SearchProvider, SearchProviderAdapter>([
  ['duckduckgo', new DuckDuckGoSearchProviderAdapter()],
  ['google', new GoogleSearchProviderAdapter()],
  ['bing', new BingSearchProviderAdapter()],
  ['youtube', new YouTubeSearchProviderAdapter()],
]);
