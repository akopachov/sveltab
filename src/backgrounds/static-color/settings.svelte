<script lang="ts">
  import ColorPicker from '$components/color-picker.svelte';
  import type { Settings } from './settings';

  export let settings: Settings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>Color</span>
  <ColorPicker bind:color={$settings.color} inline={true} />
</label>
