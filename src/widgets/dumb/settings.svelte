<script lang="ts">
  import ColorPicker from '$components/color-picker.svelte';
  import type { Settings } from './settings';
  import { BackgroundTabId } from './settings-tabs';

  export let settings: Settings;
  export let tab: number;
</script>

{#if tab === BackgroundTabId}
  <div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
      <span>Color</span>
      <ColorPicker bind:color={$settings.color} />
    </label>
  </div>
{/if}
