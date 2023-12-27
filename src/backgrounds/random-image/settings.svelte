<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';

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
  <span>{m.Backgrounds_RandomImage_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={searchTerms}
    placeholder={m.Backgrounds_RandomImage_Settings_SearchTerms_Placeholder()} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_RandomImage_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_RandomImage_Settings_Blur()}</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_RandomImage_Settings_Filter()}</span>
  <FilterSelector bind:filter={$settings.filter} />
</label>

<button class="btn variant-soft" on:click={forceUpdateBackground}>
  {m.Backgrounds_RandomImage_Settings_Refresh()}
</button>
