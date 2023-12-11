<script lang="ts">
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import type { Settings } from './settings';

  export let settings: Settings;
</script>

<label class="label">
  <span>Luminosity</span>
  <select class="select" bind:value={$settings.luminosity}>
    <option value="random">Any</option>
    <option value="bright">Bright</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<label class="label">
  <span>Hue</span>
  <select class="select" bind:value={$settings.hue}>
    <option value="random">Any</option>
    <option value="red">Red</option>
    <option value="orange">Orange</option>
    <option value="yellow">Yellow</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
    <option value="purple">Purple</option>
    <option value="pink">Pink</option>
  </select>
</label>

<button class="btn variant-soft" on:click={forceUpdateBackground}>Refresh</button>
