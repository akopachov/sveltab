<script lang="ts">
  import * as m from '$i18n/messages';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from '$shared-components/color-picker.svelte';

  let { color = $bindable(), blur = $bindable() }: { color: string; blur: number } = $props();
</script>

<div class="label">
  <span>{m.Widgets_Common_Settings_Background_Color()}</span>
  <div>
    <ColorPicker bind:color />
  </div>
</div>
<label class="label mb-2">
  <span>{m.Widgets_Common_Settings_Background_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={blur} min={0} max={15} step={0.1} />
</label>
