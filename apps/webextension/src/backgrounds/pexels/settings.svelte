<script lang="ts">
  import type { Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';

  export let settings: Settings;
  const { searchTerms, blur, filter } = settings;
  let updateInterval = settings.updateInterval.value / 60;
  $: {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  }
</script>

<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={$searchTerms}
    placeholder={m.Backgrounds_Pexels_Settings_SearchTerms_Placeholder()} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
</label>
<div>
  <span class="text-xs opacity-50">
    {m.Backgrounds_Pexels_Settings_Disclaimer()}
    <a class="anchor" href="https://www.pexels.com" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">
      Pexels
    </a>
  </span>
</div>

<button class="btn variant-soft" on:click={forceUpdateBackground}>
  {m.Backgrounds_Pexels_Settings_Refresh()}
</button>
