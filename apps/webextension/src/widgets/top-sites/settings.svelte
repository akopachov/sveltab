<script lang="ts">
  import { type Settings } from './settings';
  import * as m from '$i18n/messages';
  import { BackgroundTabId, TextTabId } from './settings-tabs';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';
  import FontSelector from '$shared-components/font-selector.svelte';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import NumberInput from '$shared-components/number-input.svelte';

  export let settings: Settings;
  export let tab: number;

  const { backgroundColor, backgroundBlur, textColor, font, textShadow, rowsCount, itemsPerRow, showTitle } = settings;
</script>

{#if tab === GeneralTabId}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_ItemsPerRow()}</span>
    <NumberInput min={1} max={100} bind:value={$itemsPerRow} />
  </label>

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_RowCount()}</span>
    <NumberInput min={1} max={100} bind:value={$rowsCount} />
  </label>

  <div class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_ShowTitle()}</span>
    <div>
      <SlideToggle name="showTitle" size="sm" bind:checked={$showTitle} />
    </div>
  </div>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_TopSites_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
    <div>
      <h4>{m.Widgets_TopSites_Settings_Shadow()}</h4>
      <div class="px-4">
        <ShadowSelector shadowSettings={textShadow} />
      </div>
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_TopSites_Settings_Background_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_Background_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
