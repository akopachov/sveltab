<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import { ClockFormat, type Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import * as m from '$i18n/messages';
  import TextSettings from '$shared-components/text-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { clockFormat, textColor, backgroundColor, backgroundBlur, font: fontSettings } = settings;
</script>

{#if tab === GeneralTabId}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span class="block">{m.Widgets_Clock_Settings_Format()}</span>
    <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
      <RadioItem bind:group={$clockFormat} name="justify" value={ClockFormat.TwelveHrs}>
        {m.Widgets_Clock_Settings_Format_12Hrs()}
      </RadioItem>
      <RadioItem bind:group={$clockFormat} name="justify" value={ClockFormat.TwentyFourHrs}>
        {m.Widgets_Clock_Settings_Format_24Hrs()}
      </RadioItem>
    </RadioGroup>
  </label>
{:else if tab === TextTabId}
  <TextSettings font={fontSettings} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Clock_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Clock_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
