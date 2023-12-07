<script lang="ts">
  import ColorPicker from '$components/color-picker.svelte';
  import type { DumbSettings } from './dumb-settings';
  import { BackgroundTabId } from './dumb-settings-tabs';

  export let settings: DumbSettings;
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
