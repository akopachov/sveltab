<script lang="ts">
  import * as m from '$i18n/messages';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import NumberInput from './number-input.svelte';

  let {
    enabled = $bindable(),
    width = $bindable(),
    height = $bindable(),
  }: {
    enabled: boolean;
    width: number;
    height: number;
  } = $props();
</script>

<label class="label flex flex-row items-center gap-3">
  <span>{m.SnappableGrid_Settings_Title()}</span>
  <SlideToggle name="snappableGridEnabled" rounded="rounded-full !m-0" bind:checked={enabled} size="sm" />
</label>

{#if enabled}
  <div class="pl-3">
    <label class="label mt-2">
      <span>{m.SnappableGrid_Settings_SnapSize_Width()}</span>
      <NumberInput min={0} bind:value={width} />
    </label>
    <label class="label mt-2">
      <span>{m.SnappableGrid_Settings_SnapSize_Height()}</span>
      <NumberInput min={0} bind:value={height} />
    </label>
  </div>
{/if}
