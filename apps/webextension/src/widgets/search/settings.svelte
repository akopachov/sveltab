<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Search_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Search_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { SearchProviders } from './providers';
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
    <span>{m.Widgets_Search_Settings_SearchProvider()}</span>
    <select class="select" bind:value={settings.searchProvider.value}>
      {#each SearchProviders as [key, provider]}
        <option value={key}>{provider.name}</option>
      {/each}
    </select>
  </label>
  <div class="label mb-2">
    <span>{m.Widgets_Search_Settings_SearchSuggestionsEnabled()}</span>
    <div>
      <SlideToggle name="searchSuggestionEnabled" size="sm" bind:checked={settings.searchSuggestionEnabled.value} />
    </div>
  </div>
{:else if tab === TextTabId}
  <TextSettings font={settings.font} bind:color={settings.textColor.value} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
