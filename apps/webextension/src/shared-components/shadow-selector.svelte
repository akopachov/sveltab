<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from './color-picker.svelte';
  import type { ShadowSettings } from '$lib/widget-settings';
  import * as m from '$i18n/messages';

  export let shadowSettings: ShadowSettings;

  const { offsetX, offsetY, blur, color } = shadowSettings;
</script>

<div class="label">
  <span>{m.ShadowSelector_Color()}</span>
  <div>
    <ColorPicker bind:color={$color} />
  </div>
</div>

<div class="flex flex-row gap-2">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label w-0 flex-1">
    <span>{m.ShadowSelector_OffsetX()}</span>
    <RangeSlider name="offsetX" bind:value={$offsetX} min={-5} max={5} step={0.1} />
  </label>

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label w-0 flex-1">
    <span>{m.ShadowSelector_OffsetY()}</span>
    <RangeSlider name="offsetY" bind:value={$offsetY} min={-5} max={5} step={0.1} />
  </label>
</div>

<div class="label">
  <span>{m.ShadowSelector_Blur()}</span>
  <RangeSlider name="blur" bind:value={$blur} min={0} max={7} step={0.1} />
</div>
