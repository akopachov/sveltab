<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';

  export let settings: Settings;

  const { locale, blur, filter } = settings;
</script>

<label class="label mb-2">
  <span>{m.Backgrounds_BingDaily_Settings_Country()}</span>
  <select class="select" bind:value={$locale}>
    <option value="random">{m.Backgrounds_BingDaily_Settings_Country_Any()}</option>
    <option value="en-AU">{m.Backgrounds_BingDaily_Settings_Country_Australia()}</option>
    <option value="en-CA">{m.Backgrounds_BingDaily_Settings_Country_Canada()}</option>
    <option value="zh-CN">{m.Backgrounds_BingDaily_Settings_Country_China()}</option>
    <option value="de-DE">{m.Backgrounds_BingDaily_Settings_Country_Germany()}</option>
    <option value="ja-JP">{m.Backgrounds_BingDaily_Settings_Country_Japan()}</option>
    <option value="en-NZ">{m.Backgrounds_BingDaily_Settings_Country_NewZealand()}</option>
    <option value="en-GB">{m.Backgrounds_BingDaily_Settings_Country_UnitedKingdom()}</option>
    <option value="en-US">{m.Backgrounds_BingDaily_Settings_Country_UnitedStates()}</option>
  </select>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_BingDaily_Settings_Blur()}</span>
  <RangeSlider name="range-slider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_BingDaily_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
</label>
<div>
  <span class="text-xs opacity-50">
    {m.Backgrounds_BingDaily_Settings_Disclaimer()}
    <a href="https://bing.com" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">Bing</a>
  </span>
</div>
