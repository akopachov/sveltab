<script lang="ts">
  import ColorPicker, { ColorPickerLayout } from '$shared-components/color-picker.svelte';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';

  export let settings: Settings;

  const { color } = settings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_StaticColor_Settings_Color()}</span>
  <div class="flex flex-col items-center">
    <ColorPicker bind:color={$color} layout={ColorPickerLayout.Inline} />
  </div>
</label>
