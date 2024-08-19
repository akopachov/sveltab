<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import NumberInput from '$shared-components/number-input.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { updateInterval: updateIntervalObs, font, textColor, backgroundColor, backgroundBlur } = settings;

  let updateInterval = $updateIntervalObs / 60;
  $: {
    $updateIntervalObs = Math.max(updateInterval, 1) * 60;
  }
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_Quote_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={$textColor}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Quote_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Quote_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
