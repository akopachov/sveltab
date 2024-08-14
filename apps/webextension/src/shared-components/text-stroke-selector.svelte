<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from './color-picker.svelte';
  import type { TextStrokeSettings } from '$lib/widget-settings';
  import * as m from '$i18n/messages';

  export let settings: TextStrokeSettings;

  const { size, color } = settings;
</script>

<div class="label">
  <span>{m.TextStrokeSelector_Size()}</span>
  <RangeSlider name="strokeSize" bind:value={$size} min={0} max={0.07} step={0.001} />
</div>

<div class="label">
  <span>{m.TextStrokeSelector_Color()}</span>
  <div>
    <ColorPicker bind:color={$color} />
  </div>
</div>
