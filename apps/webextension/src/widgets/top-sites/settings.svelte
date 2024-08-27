<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;

  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_TopSites_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_TopSites_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { type Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import NumberInput from '$shared-components/number-input.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

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
  <TextSettings {font} bind:color={$textColor} shadow={textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
