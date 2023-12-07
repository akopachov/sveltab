<script lang="ts">
  import ColorPicker from '$components/color-picker.svelte';
  import { GeneralTabId } from '$components/widget-settings.svelte';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { ClockFormat, type ClockSettings } from './clock-settings';
  import { ColorTabId, FontTabId } from './clock-settings-tabs';
  import FontSelector from '$components/font-selector.svelte';

  export let settings: ClockSettings;
  export let tab: number;

  $: fontSettings = settings.font;
</script>

{#if tab === GeneralTabId}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span class="block">Format</span>
    <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
      <RadioItem bind:group={$settings.clockFormat} name="justify" value={ClockFormat.TwelveHrs}>12-Hours</RadioItem>
      <RadioItem bind:group={$settings.clockFormat} name="justify" value={ClockFormat.TwentyFourHrs}>
        24-Hours
      </RadioItem>
    </RadioGroup>
  </label>
{:else if tab === ColorTabId}
  <div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label mb-2">
      <span>Text</span>
      <ColorPicker bind:color={$settings.textColor} />
    </label>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
      <span>Background</span>
      <ColorPicker bind:color={$settings.backgroundColor} />
    </label>
  </div>
{:else if tab === FontTabId}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span>Text font</span>
    <FontSelector bind:font={$fontSettings.id} bind:weight={$fontSettings.weight} />
  </label>
{/if}
