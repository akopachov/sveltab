import type { Lazy } from '$lib/lazy';

export interface SearchProviderAdapter {
  searchUrl(searchTerm: string): string;
  suggestionUrl(searchTerm: string): string;
  adaptSuggestions(response: any): string[];
  readonly icon: Lazy<Promise<string>>;
}
