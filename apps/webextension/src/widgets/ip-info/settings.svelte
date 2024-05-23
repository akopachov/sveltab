<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { type Settings, NetworkInfoVariables } from './settings';
  import { TextTabId, VariablesTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';

  export let settings: Settings;
  export let tab: number;

  const { font, textColor, backgroundColor, backgroundBlur, showVariables } = settings;
</script>

{#if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_IpInfo_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
    <div>
      <h4>{m.Widgets_IpInfo_Settings_Shadow()}</h4>
      <div class="pl-4 pr-4">
        <ShadowSelector shadowSettings={settings.textShadow} />
      </div>
    </div>
  </div>
{:else if tab === VariablesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={NetworkInfoVariables.IP} bind:group={$showVariables} />
    <p>IP</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={NetworkInfoVariables.Network} bind:group={$showVariables} />
    <p>Network</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={NetworkInfoVariables.ISP} bind:group={$showVariables} />
    <p>ISP</p>
  </label>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_IpInfo_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_IpInfo_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
