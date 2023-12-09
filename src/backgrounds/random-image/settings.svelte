<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';

  export let settings: Settings;
  let searchTerms = settings.searchTerms;
  let updateInterval = settings.updateInterval / 60;
  $: {
    settings.updateInterval = Math.max(updateInterval, 1) * 60;
  }

  onDestroy(() => {
    $settings.searchTerms = searchTerms;
  });
</script>

<label class="label mb-2">
  <span>Search terms</span>
  <input type="search" class="input" bind:value={searchTerms} placeholder="Fruits, animals, buildings, ..." />
</label>
<label class="label">
  <span>Update interval (minutes)</span>
  <input type="number" class="input" bind:value={updateInterval} min={1} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Blur</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
