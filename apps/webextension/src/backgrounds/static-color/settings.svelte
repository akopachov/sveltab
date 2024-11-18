<script lang="ts">
  import ColorPicker, { ColorPickerLayout } from '$shared-components/color-picker.svelte';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';

  let { settings }: { settings: Settings } = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="label">
  <span>{m.Backgrounds_StaticColor_Settings_Color()}</span>
  <div class="flex flex-col items-center">
    <ColorPicker bind:color={settings.color.value} layout={ColorPickerLayout.Inline} />
  </div>
</label>
