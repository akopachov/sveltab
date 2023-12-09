<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';

  export let settings: Settings;
</script>

<label class="label mb-2">
  <span>Country</span>
  <select class="select" bind:value={$settings.locale}>
    <option value="au">Australia</option>
    <option value="br">Brazil</option>
    <option value="ca">Canada</option>
    <option value="cn">China</option>
    <option value="de">Germany</option>
    <option value="fr">France</option>
    <option value="in">India</option>
    <option value="it">Italy</option>
    <option value="jp">Japan</option>
    <option value="es">Spain</option>
    <option value="gb">United Kingdom</option>
    <option value="us">United States</option>
  </select>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Blur</span>
  <RangeSlider name="range-slider" bind:value={$settings.blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
