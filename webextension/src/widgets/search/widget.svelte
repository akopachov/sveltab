<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import { SearchProviders } from './providers';

  export let settings: Settings;
  export let id: string;

  const {
    searchProvider,
    backgroundBlur,
    backgroundColor,
    textColor,
    font: { id: fontId, weight: fontWeight },
    searchSuggestionEnabled,
  } = settings;

  const popupSettings: PopupSettings = {
    event: 'focus-click',
    target: `Widget_Search_SuggestionPopup_${id}`,
    placement: 'bottom',
  };

  const debounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if ($searchSuggestionEnabled && str?.length > 2 && searchProviderAdapter) {
        searchSuggestions = await searchProviderAdapter.getSuggestion(str);
      } else {
        searchSuggestions = [];
      }
    },
  };

  let searchTerm: string = '';
  let searchSuggestions: string[] = [];
  let searchSuggestionContainerEl: HTMLElement;

  $: searchProviderAdapter = SearchProviders.get($searchProvider);

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

  function onSuggestionKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (!(document.activeElement instanceof HTMLElement)) return;
    let index = document.activeElement.tabIndex;

    if (e.key === 'ArrowDown') {
      index++;
    } else if (e.key === 'ArrowUp') {
      index--;
    }

    if (index >= 0 && index < searchSuggestions.length) {
      const nextElement = searchSuggestionContainerEl.querySelector(`a[tabindex="${index}"]`);
      if (nextElement instanceof HTMLElement) {
        nextElement.focus();
      }
    }
  }
</script>

<div
  class="contents rounded-[inherit]"
  style:--st-background-color={$backgroundColor}
  style:--st-text-color={$textColor}
  style:--st-font-weight={$fontWeight}
  style:--st-background-blur="{$backgroundBlur}px">
  <div
    class="input-group grid-cols-[auto_1fr] w-full h-full rounded-[inherit] !text-[var(--st-text-color)] !bg-[var(--st-background-color)] !font-[var(--st-font-weight)] !backdrop-blur-[var(--st-background-blur)]"
    use:fontsource={{
      font: $fontId,
      subsets: $userPosssibleLocaleCharSubset,
      styles: ['normal'],
      weights: [$fontWeight],
    }}>
    <div class="input-group-shim h-[100cqh] w-auto !p-[15cqh] aspect-square">
      <span class="w-full h-full {searchProviderAdapter?.iconClass || ''}"></span>
    </div>
    <form on:submit|preventDefault={doSearch}>
      <input
        type="search"
        name="searchQuery"
        class="pl-0 pt-0 pb-0 text-[max(calc(75cqh-1rem),10px)] w-full h-full placeholder:text-[var(--st-text-color)] placeholder:opacity-50"
        placeholder={m.Widgets_Search_Placeholder()}
        enterkeyhint="search"
        bind:value={searchTerm}
        use:popup={popupSettings}
        use:debounce={debounceOpts} />
    </form>
  </div>
  <div
    class="w-full ml-[-50cqh] rounded !text-[var(--st-text-color)] !bg-[var(--st-background-color)] !font-[var(--st-font-weight)] !backdrop-blur-[var(--st-background-blur)]"
    data-popup={popupSettings.target}
    style:visibility={searchSuggestions.length > 0 ? 'visible' : 'hidden'}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <nav
      class="list-nav text-[calc(70cqh-1rem)]"
      on:keydown={onSuggestionKeyDown}
      bind:this={searchSuggestionContainerEl}>
      <ul>
        {#each searchSuggestions as suggestion, index}
          <li>
            <a
              class="!pt-0 !pb-0 leading-relaxed text-[max(1em,10px)]"
              rel="noreferrer"
              tabindex={index}
              href={searchProviderAdapter?.searchUrl(suggestion)}>
              {suggestion}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>
