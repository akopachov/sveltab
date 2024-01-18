export interface SearchProvider {
  searchUrl(searchTerm: string): string;
  readonly iconClass: string;
  readonly name: string;
}

export interface SearchSuggestionProvider {
  suggestionUrl(searchTerm: string): string;
  adaptSuggestions(response: any): string[];
}

export function canSuggest(provider: any): provider is SearchSuggestionProvider {
  return 'suggestionUrl' in provider && 'adaptSuggestions' in provider;
}
