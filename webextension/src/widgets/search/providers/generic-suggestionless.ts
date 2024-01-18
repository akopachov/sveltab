import type { SearchProvider } from './search-provider';

export class GenericSuggestionlessProvider implements SearchProvider {
  #searchUrl: string;
  constructor(name: string, searchUrl: string, iconClass: string) {
    this.name = name;
    this.#searchUrl = searchUrl;
    this.iconClass = iconClass;
  }
  searchUrl(searchTerm: string) {
    return this.#searchUrl.replace('{searchTerms}', encodeURIComponent(searchTerm));
  }
  readonly iconClass;
  readonly name;
}
