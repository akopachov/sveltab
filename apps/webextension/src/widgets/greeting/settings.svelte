<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { name, font, textColor, backgroundColor, backgroundBlur } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Greeting_Settings_Name()}</span>
    <input type="text" class="input" bind:value={$name} />
  </label>
{:else if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Greeting_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Greeting_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
