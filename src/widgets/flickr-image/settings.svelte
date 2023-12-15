<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import NumberInput from '$components/number-input.svelte';
  import { ImageTabId } from './settings-tabs';

  export let settings: Settings;
  export let tab: number;

  let updateInterval = settings.updateInterval / 60;
  $: {
    settings.updateInterval = Math.max(updateInterval, 1) * 60;
  }
</script>

{#if tab === ImageTabId}
  <label class="label mb-2">
    <span>{m.Widgets_FlickrImage_Settings_Topic()}</span>
    <input type="search" class="input" bind:value={$settings.searchTopic} />
  </label>
  <div class="label">
    <span>{m.Widgets_FlickrImage_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
{/if}
