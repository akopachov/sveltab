<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';

  export let settings: Settings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_StaticColor_Settings_Color()}</span>
  <ColorPicker bind:color={$settings.color} inline={true} />
</label>
