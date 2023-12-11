<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';

  export let settings: Settings;
</script>

<label class="label mb-2">
  <span>Country</span>
  <select class="select" bind:value={$settings.locale}>
    <option value="random">Any</option>
    <option value="en-AU">Australia</option>
    <option value="en-CA">Canada</option>
    <option value="zh-CN">China</option>
    <option value="de-DE">Germany</option>
    <option value="ja-JP">Japan</option>
    <option value="en-NZ">New Zealand</option>
    <option value="en-GB">United Kingdom</option>
    <option value="en-US">United States</option>
  </select>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Blur</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
