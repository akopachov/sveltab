<script lang="ts">
  import ColorPicker from '$components/color-picker.svelte';
  import { GeneralTabId } from '$components/widget-settings.svelte';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import { ClockFormat, type Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$components/font-selector.svelte';
  import * as m from '$i18n/messages';

  export let settings: Settings;
  export let tab: number;

  $: fontSettings = settings.font;
</script>

{#if tab === GeneralTabId}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span class="block">{m.Widgets_Clock_Settings_Format()}</span>
    <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
      <RadioItem bind:group={$settings.clockFormat} name="justify" value={ClockFormat.TwelveHrs}>
        {m.Widgets_Clock_Settings_Format_12Hrs()}
      </RadioItem>
      <RadioItem bind:group={$settings.clockFormat} name="justify" value={ClockFormat.TwentyFourHrs}>
        {m.Widgets_Clock_Settings_Format_24Hrs()}
      </RadioItem>
    </RadioGroup>
  </label>
{:else if tab === TextTabId}
  <div>
    <div class="label">
      <span>{m.Widgets_Clock_Settings_Font()}</span>
      <FontSelector bind:font={$fontSettings.id} bind:weight={$fontSettings.weight} bind:color={$settings.textColor} />
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Clock_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$settings.backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Clock_Settings_Blur()}</span>
    <RangeSlider name="range-slider" bind:value={$settings.backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
