<script lang="ts">
  import * as m from '$i18n/messages';
  import { Paginator, type PaginationSettings, ProgressRadial } from '@skeletonlabs/skeleton';
  import { imgSrcEx } from '$actions/img-src-ex';
  import { AppliedColorScheme } from '$actions/color-scheme';
  import ColorPicker, { ColorPickerLayout } from '$shared-components/color-picker.svelte';
  import { getSvgUrl } from '../../lib/service-mirrors';
  import { secondsToMilliseconds } from 'date-fns';
  import { derivedDebounce } from '$stores/rune-utils.svelte';

  let {
    icon = $bindable(),
    color = $bindable(),
    onselected,
  }: { icon: string; color: string; onselected?: (arg: { icon: string }) => void } = $props();

  let searchQuery: string = $state('');
  let allIcons: string[] = $state([]);
  let previewIconColor = $derived($AppliedColorScheme === 'dark' ? '#fff' : '#000');

  let paginationSettings: PaginationSettings = $state({
    page: 0,
    limit: 15,
    size: 0,
    amounts: [15],
  });

  let currentPage = $derived(
    allIcons.slice(
      paginationSettings.page * paginationSettings.limit,
      paginationSettings.page * paginationSettings.limit + paginationSettings.limit,
    ),
  );

  let iconsUpdatePromise = $derived.by(
    derivedDebounce(() => updateIconsList(), secondsToMilliseconds(1), { activityNotificator: () => searchQuery }),
  );

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
    onselected?.({ icon: iconStr });
  }
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr]">
  <div class="input-group-shim !p-[0_20px]"></div>
  <input
    type="search"
    bind:value={searchQuery}
    placeholder={m.Widgets_Link_Settings_IconSource_Iconify_Search_Placeholder()} />
</div>
<div
  class="absolute w-6 h-6 !mt-[-32px] !ml-[9px]"
  title={m.Widgets_Link_Settings_IconSource_Iconify_Search_IconColor_Title()}>
  <ColorPicker bind:color layout={ColorPickerLayout.ButtonPopup} />
</div>
<div>
  <span class="text-xs opacity-50">
    {m.Widgets_Link_Settings_IconSource_Iconify_Search_Disclaimer()}
    <a href="https://iconify.design/" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">Iconify</a>
  </span>
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
          onclick={() => selectIcon(iconStr)}>
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
