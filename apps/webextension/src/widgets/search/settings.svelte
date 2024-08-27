<script context="module" lang="ts">
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

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { searchProvider, font, textColor, backgroundBlur, backgroundColor, searchSuggestionEnabled } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Search_Settings_SearchProvider()}</span>
    <select class="select" bind:value={$searchProvider}>
      {#each SearchProviders as [key, provider]}
        <option value={key}>{provider.name}</option>
      {/each}
    </select>
  </label>
  <div class="label mb-2">
    <span>{m.Widgets_Search_Settings_SearchSuggestionsEnabled()}</span>
    <div>
      <SlideToggle name="searchSuggestionEnabled" size="sm" bind:checked={$searchSuggestionEnabled} />
    </div>
  </div>
{:else if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
