<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import NumberInput from '$shared-components/number-input.svelte';
  import { ImageTabId } from './settings-tabs';

  export let settings: Settings;
  export let tab: number;

  const { updateInterval: updateIntervalObs, searchTopic } = settings;

  let updateInterval = $updateIntervalObs / 60;

  $: {
    $updateIntervalObs = Math.max(updateInterval, 1) * 60;
  }
</script>

{#if tab === ImageTabId}
  <label class="label mb-2">
    <span>{m.Widgets_FlickrImage_Settings_Topic()}</span>
    <input type="search" class="input" bind:value={$searchTopic} />
  </label>
  <div class="label">
    <span>{m.Widgets_FlickrImage_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
  <div>
    <span class="text-xs opacity-50">
      {m.Widgets_FlickrImage_Settings_Disclaimer()}
      <a href="https://www.flickr.com/" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">Flickr</a>
    </span>
  </div>
{/if}
