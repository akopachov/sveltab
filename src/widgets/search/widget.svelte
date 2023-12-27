<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import { SearchProviderAdapters } from './providers';

  export let settings: Settings;
  export let id: string;

  const popupSettings: PopupSettings = {
    event: 'focus-click',
    target: `Widget_Search_SuggestionPopup_${id}`,
    placement: 'bottom',
  };

  const debounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if (str?.length > 2 && searchProviderAdapter) {
        const suggestionUrl = searchProviderAdapter.suggestionUrl(str);
        const response = await fetch(suggestionUrl).then(r => r.json());
        searchSuggestions = searchProviderAdapter.adaptSuggestions(response);
      } else {
        searchSuggestions = [];
      }
    },
  };

  let searchTerm: string = '';
  let searchSuggestions: string[] = [];

  $: fontSettings = settings.font;
  $: searchProviderAdapter = SearchProviderAdapters.get($settings.searchProvider);

  $: {
    if (!searchTerm) {
      searchSuggestions = [];
    }
  }

  function doSearch() {
    if (searchTerm) {
      if (searchProviderAdapter) {
        location.assign(searchProviderAdapter.searchUrl(searchTerm));
      }
      searchTerm = '';
    }
  }
</script>

<div
  class="contents rounded-[inherit]"
  style:--st-background-color={$settings.backgroundColor}
  style:--st-text-color={$settings.textColor}
  style:--st-font-weight={$fontSettings.weight}
  style:--st-background-blur="{$settings.backgroundBlur}px">
  <div
    class="input-group grid-cols-[auto_1fr] w-full h-full rounded-[inherit] !text-[var(--st-text-color)] !bg-[var(--st-background-color)] !font-[var(--st-font-weight)] !backdrop-blur-[var(--st-background-blur)]"
    use:fontsource={{
      font: $fontSettings.id,
      subsets: $userPosssibleLocaleCharSubset,
      styles: ['normal'],
      weights: [$fontSettings.weight],
    }}>
    <div class="input-group-shim h-[100cqh] w-auto !p-[15cqh] aspect-square [&>*]:w-full [&>*]:h-full">
      {#await searchProviderAdapter?.icon.getValue() then icon}
        {@html icon}
      {/await}
    </div>
    <form on:submit={doSearch}>
      <input
        type="search"
        class="pl-0 pt-0 pb-0 text-[max(calc(75cqh-1rem),10px)] w-full h-full placeholder:text-[var(--st-text-color)] placeholder:opacity-50"
        placeholder={m.Widgets_Search_Placeholder()}
        bind:value={searchTerm}
        use:popup={popupSettings}
        use:debounce={debounceOpts} />
    </form>
  </div>
  <div
    class="w-full ml-[-50cqh] rounded !text-[var(--st-text-color)] !bg-[var(--st-background-color)] !font-[var(--st-font-weight)] !backdrop-blur-[var(--st-background-blur)]"
    data-popup={popupSettings.target}
    style:visibility={searchSuggestions.length > 0 ? 'visible' : 'hidden'}>
    <nav class="list-nav text-[calc(70cqh-1rem)]">
      <ul>
        {#each searchSuggestions as suggestion}
          <li>
            <a
              class="!pt-0 !pb-0 leading-relaxed text-[max(1em,10px)]"
              rel="noreferrer"
              href={searchProviderAdapter?.searchUrl(suggestion)}>
              {suggestion}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>
