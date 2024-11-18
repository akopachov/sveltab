<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from './color-picker.svelte';
  import type { ShadowSettings } from '$lib/widget-settings';
  import * as m from '$i18n/messages';

  let { shadowSettings }: { shadowSettings: ShadowSettings } = $props();
</script>

<div class="label">
  <span>{m.ShadowSelector_Color()}</span>
  <div>
    <ColorPicker bind:color={shadowSettings.color.value} />
  </div>
</div>

<div class="flex flex-row gap-2">
  <!-- svelte-ignore -->
  <label class="label w-0 flex-1">
    <span>{m.ShadowSelector_OffsetX()}</span>
    <RangeSlider name="offsetX" bind:value={shadowSettings.offsetX.value} min={-5} max={5} step={0.1} />
  </label>

  <!-- svelte-ignore -->
  <label class="label w-0 flex-1">
    <span>{m.ShadowSelector_OffsetY()}</span>
    <RangeSlider name="offsetY" bind:value={shadowSettings.offsetY.value} min={-5} max={5} step={0.1} />
  </label>
</div>

<div class="label">
  <span>{m.ShadowSelector_Blur()}</span>
  <RangeSlider name="blur" bind:value={shadowSettings.blur.value} min={0} max={7} step={0.1} />
</div>
