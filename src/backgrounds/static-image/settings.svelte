<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import FilterSelect from '$components/filter-select.svelte';

  export let settings: Settings;
  let url = settings.url;

  onDestroy(() => {
    $settings.url = url;
  });
</script>

<label class="label mb-2">
  <span>{m.Backgrounds_StaticImage_Settings_Url()}</span>
  <input type="url" class="input" bind:value={url} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_StaticImage_Settings_Blur()}</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_StaticImage_Settings_Filter()}</span>
  <FilterSelect bind:filter={$settings.filter} />
</label>
