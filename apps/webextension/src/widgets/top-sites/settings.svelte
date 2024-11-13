<script module lang="ts">
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
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_ItemsPerRow()}</span>
    <NumberInput min={1} max={100} bind:value={settings.itemsPerRow.value} />
  </label>

  <label class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_RowCount()}</span>
    <NumberInput min={1} max={100} bind:value={settings.rowsCount.value} />
  </label>

  <div class="label mb-2">
    <span>{m.Widgets_TopSites_Settings_ShowTitle()}</span>
    <div>
      <SlideToggle name="showTitle" size="sm" bind:checked={settings.showTitle.value} />
    </div>
  </div>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
