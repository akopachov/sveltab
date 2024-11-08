<script module lang="ts">
  import * as m from '$i18n/messages';

  const ImageTabId = 1;

  const Tabs = [
    {
      id: ImageTabId,
      title: () => m.Widgets_FlickrImage_Settings_Tabs_Image(),
    },
  ];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import { minutesToSeconds, secondsToMinutes } from 'date-fns';
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let updateIntervalMinutes = $state(secondsToMinutes(settings.updateInterval.value));

  $effect(() => {
    settings.updateInterval.value = minutesToSeconds(Math.max(updateIntervalMinutes, 1));
  });

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === ImageTabId}
  <label class="label mb-2">
    <span>{m.Widgets_FlickrImage_Settings_Topic()}</span>
    <input type="search" class="input" bind:value={settings.searchTopic.value} />
  </label>
  <div class="label">
    <span>{m.Widgets_FlickrImage_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateIntervalMinutes} min={1} />
  </div>
  <div>
    <span class="text-xs opacity-50">
      {m.Widgets_FlickrImage_Settings_Disclaimer()}
      <a href="https://www.flickr.com/" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">Flickr</a>
    </span>
  </div>
{/if}
