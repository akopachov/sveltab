<script lang="ts">
  import { cache } from '$stores/cache';
  import { ProgressRadial, type PopupSettings, popup } from '@skeletonlabs/skeleton';
  import VirtualScroll from 'svelte-virtual-scroll-list';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import ColorPicker from './color-picker.svelte';
  import * as m from '$i18n/messages';

  type FontInfo = { label: string; id: string; searchIndex: string; weights: number[]; styles: string[] };

  export let font: string | null | undefined;
  export let color: string | null | undefined = null;
  export let weight: number | null | undefined;

  let selectedFontInfo: FontInfo;
  $: {
    if (selectedFontInfo && (!weight || !selectedFontInfo.weights.includes(weight))) {
      weight = selectedFontInfo.weights[0];
    }
  }

  const fonts: Promise<FontInfo[]> = cache(
    'fonts',
    async () =>
      fetch('https://api.fontsource.org/v1/fonts')
        .then(r => r.json())
        .then(r =>
          r
            .filter((f: any) => f.type !== 'icons')
            .map(
              (f: any) =>
                <FontInfo>{
                  label: f.family,
                  id: f.id,
                  searchIndex: f.family.toLowerCase(),
                  weights: f.weights,
                  styles: f.styles,
                },
            ),
        ),
    60 * 60 * 24, // 1 Day
  );

  const fontWeightsMap = new Map<number, () => string>([
    [100, m.FontSelector_Weight_Thin],
    [200, m.FontSelector_Weight_ExtraLight],
    [300, m.FontSelector_Weight_Light],
    [400, m.FontSelector_Weight_Normal],
    [500, m.FontSelector_Weight_Medium],
    [600, m.FontSelector_Weight_SemiBold],
    [700, m.FontSelector_Weight_Bold],
    [800, m.FontSelector_Weight_ExtraBold],
    [900, m.FontSelector_Weight_Heavy],
  ]);

  let searchValue = writable('');
  let fontList: VirtualScroll;
  let fontSelectVisible: boolean = false;

  let debounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if (str && fontList) {
        const loadedFonts = await fonts;
        const normalizedStr = str.toLowerCase();
        const index = loadedFonts.findIndex(f => f.searchIndex.startsWith(normalizedStr));
        if (index >= 0) {
          fontList.scrollToIndex(index);
        }
      }
    },
  };

  let popupSettings: PopupSettings = {
    event: 'focus-click',
    target: 'popupAutocomplete',
    placement: 'bottom',
    middleware: {
      flip: {
        fallbackAxisSideDirection: 'start',
      },
    },
    state: v => (fontSelectVisible = v.state),
  };

  function onSelected(e: FontInfo) {
    selectedFontInfo = e;
    $searchValue = e.label;
    font = e.id;
    if (weight && !e.weights.includes(weight)) {
      weight = e.weights[0];
    }
  }

  onMount(async () => {
    if (font) {
      const loadedFonts = await fonts;
      const index = loadedFonts.findIndex(f => f.id == font);
      if (index >= 0) {
        selectedFontInfo = loadedFonts[index];
        $searchValue = selectedFontInfo.label;
        fontList.scrollToIndex(index);
      }
    }
  });
</script>

<div class="contents">
  <div
    class="input-group input-group-divider"
    class:grid-cols-[auto_1fr_auto]={!!color}
    class:grid-cols-[1fr_auto]={!color}>
    {#if color}
      <div class="input-group-shim !p-[0_20px]"></div>
    {/if}
    <input
      type="search"
      bind:value={$searchValue}
      placeholder={m.FontSelector_Search_Placeholder()}
      use:popup={popupSettings}
      use:debounce={debounceOpts} />
    {#if selectedFontInfo}
      <select bind:value={weight}>
        {#each selectedFontInfo.weights as w}
          {@const optionTextFn = fontWeightsMap.get(w) || (() => String(w))}
          <option value={w}>{optionTextFn()}</option>
        {/each}
      </select>
    {/if}
  </div>
</div>
{#if color}
  <div class="absolute w-6 h-6 !mt-[-32px] !ml-[9px]">
    <ColorPicker bind:color class="!p-0 font-color-picker bg-transparent" />
  </div>
{/if}
<div
  class="card w-fit max-w-[100cqw] max-h-[calc(100cqh-16px)] h-fit overflow-y-auto flex"
  tabindex="-1"
  style:visibility={fontSelectVisible ? 'visible' : 'hidden'}
  data-popup={popupSettings.target}>
  {#await fonts}
    <ProgressRadial />
  {:then fontsResult}
    <div class="flex p-4 max-h-[inherit]">
      <VirtualScroll bind:this={fontList} data={fontsResult} let:data>
        <button
          class="btn {font === data.id ? 'variant-filled' : 'variant-soft'} w-full mb-1 rounded-sm"
          on:click={() => onSelected(data)}>
          {data.label}
        </button>
      </VirtualScroll>
    </div>
  {/await}
</div>
