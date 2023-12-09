<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';

  export let settings: Settings;
  let url = settings.url;

  onDestroy(() => {
    $settings.url = url;
  });
</script>

<label class="label mb-2">
  <span>URL</span>
  <input type="url" class="input" bind:value={url} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Blur</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
