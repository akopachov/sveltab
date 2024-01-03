<script lang="ts">
  import * as m from '$i18n/messages';
  import { Paginator, type PaginationSettings, ProgressRadial } from '@skeletonlabs/skeleton';
  import { imgSrcEx } from '$actions/img-src-ex';

  import pDebounce from 'p-debounce';
  import { createEventDispatcher } from 'svelte';
  import { AppliedColorScheme } from '$actions/color-scheme';
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { getSvgUrl } from '../../lib/iconify-api';
  import { secondsToMilliseconds } from 'date-fns';

  export let icon: string;
  export let color: string;

  let searchQuery: string = '';
  let allIcons: string[] = [];
  let iconsUpdatePromise: Promise<void> | undefined;
  const dispatch = createEventDispatcher();
  $: previewIconColor = $AppliedColorScheme === 'dark' ? '#fff' : '#000';

  let paginationSettings: PaginationSettings = {
    page: 0,
    limit: 15,
    size: allIcons.length,
    amounts: [15],
  };

  $: currentPage = allIcons.slice(
    paginationSettings.page * paginationSettings.limit,
    paginationSettings.page * paginationSettings.limit + paginationSettings.limit,
  );

  $: {
    searchQuery;
    iconsUpdatePromise = updateIconsListDebounced();
  }

  const updateIconsListDebounced = pDebounce(updateIconsList, secondsToMilliseconds(1));
  async function updateIconsList() {
    if (searchQuery.length > 0) {
      const iconifyInfo = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(searchQuery)}&limit=999`,
      ).then(r => r.json());
      paginationSettings.page = 0;
      paginationSettings.size = iconifyInfo.total;

      allIcons = iconifyInfo.icons;
    } else {
      paginationSettings.size = 0;
      allIcons = [];
    }
  }

  function selectIcon(iconStr: string) {
    icon = iconStr;
    dispatch('selected', { icon: iconStr });
  }
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr]">
  <div class="input-group-shim !p-[0_20px]"></div>
  <input
    type="search"
    class="input"
    bind:value={searchQuery}
    placeholder={m.Widgets_Link_Settings_IconSource_Iconify_Search_Placeholder()} />
</div>
<div
  class="absolute w-6 h-6 !mt-[-32px] !ml-[9px]"
  title={m.Widgets_Link_Settings_IconSource_Iconify_Search_IconColor_Title()}>
  <ColorPicker bind:color class="!p-0 bg-transparent" />
</div>

<div class="grid gap-2 grid-cols-[repeat(auto-fit,minmax(50px,1fr))] mt-2">
  {#await iconsUpdatePromise}
    <ProgressRadial width="w-12 ml-[auto] mr-[auto]" />
  {:then}
    {#if currentPage.length > 0}
      {#each currentPage as iconStr}
        <button
          class="btn btn-icon-base w-full h-full !p-1 variant-soft min-w-[50px] max-w-[64px] rounded-sm icon"
          class:!variant-filled-primary={icon === iconStr}
          on:click={() => selectIcon(iconStr)}>
          <img
            class="aspect-square w-full h-full"
            use:imgSrcEx={getSvgUrl(iconStr, previewIconColor)}
            alt={m.Widgets_Link_Settings_IconSource_Iconify_Search_IconAlt({ icon: iconStr })} />
        </button>
      {/each}
    {:else if searchQuery}
      <p class="text-center py-2">{m.Widgets_Link_Settings_IconSource_Iconify_Search_NoIcons()}</p>
    {/if}
  {/await}
</div>
{#if allIcons.length > paginationSettings.limit}
  <div class="mt-2">
    <Paginator
      bind:settings={paginationSettings}
      showFirstLastButtons={false}
      showPreviousNextButtons={true}
      showNumerals={true}
      controlVariant="variant-soft"
      select="hidden" />
  </div>
{/if}
