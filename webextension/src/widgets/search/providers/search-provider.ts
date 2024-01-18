export interface SearchProvider {
  searchUrl(searchTerm: string): string;
  getSuggestion(searchTerm: string): Promise<string[]>;
  readonly iconClass: string;
  readonly name: string;
}
