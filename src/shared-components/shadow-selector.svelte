<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from './color-picker.svelte';
  import type { ShadowSettings } from '$models/widget-settings';
  import * as m from '$i18n/messages';

  export let shadowSettings: ShadowSettings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.ShadowSelector_OffsetX()}</span>
  <RangeSlider name="offsetX" bind:value={$shadowSettings.offsetX} min={-5} max={5} step={0.1} />
</label>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.ShadowSelector_OffsetY()}</span>
  <RangeSlider name="offsetY" bind:value={$shadowSettings.offsetY} min={-5} max={5} step={0.1} />
</label>

<div class="label">
  <span>{m.ShadowSelector_Blur()}</span>
  <RangeSlider name="blur" bind:value={$shadowSettings.blur} min={0} max={7} step={0.1} />
</div>

<div class="label">
  <span>{m.ShadowSelector_Color()}</span>
  <div>
    <ColorPicker bind:color={$shadowSettings.color} />
  </div>
</div>
