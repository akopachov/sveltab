import { BingSearchProvider } from './bing';
import { BraveSearchProvider } from './brave';
import { DuckDuckGoSearchProvider } from './duckduckgo';
import { GoogleSearchProvider } from './google';
import type { SearchProvider } from './search-provider';
import { YouTubeSearchProvider } from './youtube';
import { MetacrawlerSearchProvider } from './metacrawler';
import { SearxSearchProvider } from './searx';
import { CustomSearchProvider } from './custom';

export type SearchProviderDescriptor = {
  readonly displayName: string;
  readonly factory: (...args: any[]) => SearchProvider;
};

export type SearchProviderName =
  | 'google'
  | 'duckduckgo'
  | 'bing'
  | 'youtube'
  | 'brave'
  | 'metacrawler'
  | 'searx'
  | 'custom';

export const SearchProviders: ReadonlyMap<SearchProviderName, SearchProviderDescriptor> = new Map<
  SearchProviderName,
  SearchProviderDescriptor
>([
  ['duckduckgo', { displayName: 'DuckDuckGo', factory: () => new DuckDuckGoSearchProvider() }],
  ['google', { displayName: 'Google', factory: () => new GoogleSearchProvider() }],
  ['bing', { displayName: 'Bing', factory: () => new BingSearchProvider() }],
  ['youtube', { displayName: 'YouTube', factory: () => new YouTubeSearchProvider() }],
  ['brave', { displayName: 'Brave', factory: () => new BraveSearchProvider() }],
  ['metacrawler', { displayName: 'MetaCrawler', factory: () => new MetacrawlerSearchProvider() }],
  ['searx', { displayName: 'Searx\\SearXNG', factory: s => new SearxSearchProvider(s) }],
  ['custom', { displayName: 'Custom', factory: s => new CustomSearchProvider(s) }],
]);
