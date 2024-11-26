<script module lang="ts">
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
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === VariablesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={NetworkInfoVariables.IP} bind:group={settings.showVariables.value} />
    <p>IP</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={NetworkInfoVariables.ASN}
      bind:group={settings.showVariables.value} />
    <p>ASN</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={NetworkInfoVariables.ISP}
      bind:group={settings.showVariables.value} />
    <p>ISP</p>
  </label>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
