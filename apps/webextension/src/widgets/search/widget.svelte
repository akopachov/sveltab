<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import { SearchProviders } from './providers';
  import { textStroke } from '$actions/text-stroke';

  let { settings, id }: { settings: Settings; id: string } = $props();

  const popupSettings: PopupSettings = {
    event: 'focus-click',
    target: `Widget_Search_SuggestionPopup_${id}`,
    placement: 'bottom',
  };

  const debounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if (settings.searchSuggestionEnabled.value && str?.length > 2 && searchProviderAdapter && navigator.onLine) {
        searchSuggestions = await searchProviderAdapter.getSuggestion(str);
      } else {
        searchSuggestions = [];
      }
    },
  };

  let searchTerm: string = $state('');
  let searchSuggestions: string[] = $state([]);
  let searchSuggestionContainerEl: HTMLElement | undefined = $state();

  let searchProviderAdapter = $derived(SearchProviders.get(settings.searchProvider.value)?.factory(settings));

  function doSearch(e: Event) {
    e.preventDefault();
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

    if (index >= 0 && index < searchSuggestions.length && searchSuggestionContainerEl) {
      const nextElement = searchSuggestionContainerEl.querySelector(`a[tabindex="${index}"]`);
      if (nextElement instanceof HTMLElement) {
        nextElement.focus();
      }
    }
  }
</script>

<div
  class="contents rounded-[inherit]"
  style:--st-background-color={settings.backgroundColor.value}
  style:--st-text-color={settings.textColor.value}
  style:--st-font-weight={settings.font.weight.value}
  style:--st-background-blur="{settings.backgroundBlur.value}px">
  <div
    class="input-group border-none flex w-full h-full rounded-[inherit] !text-[var(--st-text-color)] !bg-[var(--st-background-color)] !font-[var(--st-font-weight)] !backdrop-blur-[var(--st-background-blur)]"
    use:fontsource={{
      font: settings.font.id.value,
      subsets: $userPosssibleLocaleCharSubset,
      styles: ['normal'],
      weights: [settings.font.weight.value],
    }}
    use:textStroke={settings.textStroke}>
    <div class="input-group-shim h-full w-auto !p-[calc(15cqh-var(--st-border-size)/2)] aspect-square bg-transparent">
      <span class="w-full h-full {searchProviderAdapter?.iconClass || ''}"></span>
    </div>
    <form onsubmit={doSearch} class="w-full">
      <input
        type="search"
        name="searchQuery"
        class="pl-0 pt-0 pb-0 text-[max(calc(75cqh-var(--st-border-size)/2-1rem),10px)] w-full h-full placeholder:text-[var(--st-text-color)] placeholder:opacity-50 [-webkit-text-stroke:var(--sv-text-stroke)]"
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
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <nav
      class="list-nav text-[calc(70cqh-1rem)] [-webkit-text-stroke:var(--sv-text-stroke)]"
      onkeydown={onSuggestionKeyDown}
      bind:this={searchSuggestionContainerEl}>
      <ul>
        {#each searchSuggestions as suggestion, index}
          <li>
            <a
              class="!pt-0 !pb-0 leading-relaxed text-[max(1em,10px)] focus:!text-inherit"
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
