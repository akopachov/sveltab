<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const VariablesTabId = 2;
  const BackgroundTabId = 3;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_AirQuality_Settings_Tabs_Text(),
    },
    {
      id: VariablesTabId,
      title: () => m.Widgets_AirQuality_Settings_Tabs_Variables(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_AirQuality_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { AirQualityLegislation, AirQualityVariables, type Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import LocationSelect from '$shared-components/location-select.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={settings.queryUserLocation.value} />
    <p>{m.Widgets_AirQuality_Settings_Location_QueryBrowser()}</p>
  </label>
  {#if settings.queryUserLocation.value != true}
    <div class="mb-2">
      <LocationSelect location={settings.location} />
    </div>
  {/if}
  <label class="label mb-2">
    <span>{m.Widgets_AirQuality_Settings_Legislation()}</span>
    <select class="select" bind:value={settings.legislation.value}>
      <option value={AirQualityLegislation.European}>{m.Widgets_AirQuality_Settings_Legislation_European()}</option>
      <option value={AirQualityLegislation.USA}>{m.Widgets_AirQuality_Settings_Legislation_USA()}</option>
    </select>
  </label>
{:else if tab === VariablesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.PM2_5}
      bind:group={settings.showVariables.value} />
    <p>
      PM
      <sub>2.5</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.PM10}
      bind:group={settings.showVariables.value} />
    <p>
      PM
      <sub>10</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.CarbonMonoxide}
      bind:group={settings.showVariables.value} />
    <p>CO</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.NitrogenDioxide}
      bind:group={settings.showVariables.value} />
    <p>
      NO
      <sub>2</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.SulfurDioxide}
      bind:group={settings.showVariables.value} />
    <p>
      SO
      <sub>2</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={AirQualityVariables.Ozone}
      bind:group={settings.showVariables.value} />
    <p>
      O
      <sub>3</sub>
    </p>
  </label>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
