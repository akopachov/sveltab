<script context="module" lang="ts">
  const SearchProviderUrlGenerators = new Map<SearchProvider, (searchTerm: string) => string>([
    ['duckduckgo', (searchTerm: string) => `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`],
    ['google', (searchTerm: string) => `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`],
    ['bing', (searchTerm: string) => `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`],
  ]);
</script>

<script lang="ts">
  import type { SearchProvider, Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { localeCharSubset } from '$stores/locale';
  import * as m from '$i18n/messages';
  import { goto } from '$app/navigation';

  export let settings: Settings;

  let searchTerm: string = '';

  $: fontSettings = settings.font;

  function doSearch() {
    if (searchTerm) {
      const urlGenerator = SearchProviderUrlGenerators.get($settings.searchProvider);
      if (urlGenerator) {
        goto(urlGenerator(searchTerm));
      }
      searchTerm = '';
    }
  }
</script>

<div
  class="input-group grid-cols-[auto_1fr] w-full h-full rounded-[inherit]"
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}>
  <div class="input-group-shim !p-0">
    <img
      class="h-[100cqh] w-auto p-[15cqh] aspect-square"
      alt={$settings.searchProvider}
      src="./widgets/search/provider_logo_{$settings.searchProvider}.svg" />
  </div>
  <form on:submit={doSearch}>
    <input
      type="search"
      class="pl-0 text-[calc(75cqh-1rem)] w-full h-full"
      placeholder={m.Widgets_Search_Placeholder()}
      bind:value={searchTerm} />
  </form>
</div>
