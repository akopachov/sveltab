<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';

  export let settings: Settings;

  const { blur, filter } = settings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_NasaApod_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_NasaApod_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
</label>
<div>
  <span class="text-xs opacity-50">
    {m.Backgrounds_NasaApod_Settings_Disclaimer()}
    <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">
      NASA
    </a>
  </span>
</div>
