<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const VariablesTabId = 2;
  const BackgroundTabId = 3;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_IpInfo_Settings_Tabs_Text(),
    },
    {
      id: VariablesTabId,
      title: () => m.Widgets_IpInfo_Settings_Tabs_Variables(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_IpInfo_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { type Settings, NetworkInfoVariables } from './settings';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { font, textColor, backgroundColor, backgroundBlur, showVariables } = settings;
</script>

{#if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
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
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
