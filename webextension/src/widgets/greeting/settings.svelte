<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { name, font, textColor, backgroundColor, backgroundBlur } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Greating_Settings_Name()}</span>
    <input type="text" class="input" bind:value={$name} />
  </label>
{:else if tab === TextTabId}
  <div>
    <div class="label">
      <span>{m.Widgets_Greating_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
    <div class="mt-2">
      <h4>{m.Widgets_Greating_Settings_Shadow()}</h4>
      <div class="pl-4 pr-4">
        <ShadowSelector shadowSettings={settings.textShadow} />
      </div>
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Greating_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Greating_Settings_Blur()}</span>
    <RangeSlider name="range-slider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
