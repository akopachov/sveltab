<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import NumberInput from '$components/number-input.svelte';

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
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Update interval (minutes)</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Blur</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>

<button class="btn variant-soft" on:click={forceUpdateBackground}>Refresh</button>
