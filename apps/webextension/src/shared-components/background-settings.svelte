<script lang="ts">
  import * as m from '$i18n/messages';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import ColorPicker from '$shared-components/color-picker.svelte';

  export let color: string;
  export let blur: number;
</script>

<div class="label">
  <span>{m.Widgets_Common_Settings_Background_Color()}</span>
  <div>
    <ColorPicker bind:color />
  </div>
</div>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label mb-2">
  <span>{m.Widgets_Common_Settings_Background_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={blur} min={0} max={15} step={0.1} />
</label>
