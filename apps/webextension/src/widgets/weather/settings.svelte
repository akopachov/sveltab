<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const LayoutTabId = 2;
  const BackgroundTabId = 3;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Weather_Settings_Tabs_Text(),
    },
    {
      id: LayoutTabId,
      title: () => m.Widgets_Weather_Settings_Tabs_Layout(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Weather_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { MeasurementUnits, type Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import LocationSelect from '$shared-components/location-select.svelte';
  import { AssetsPacks } from './asset-packs';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const {
    measurementUnits,
    assetPack,
    font,
    textColor,
    backgroundBlur,
    backgroundColor,
    queryUserLocation,
    showDetails,
    showCity,
    showAdminArea1,
    showCountry,
    showCurrentIcon,
  } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$queryUserLocation} />
    <p>{m.Widgets_Weather_Settings_Location_QueryBrowser()}</p>
  </label>
  {#if $queryUserLocation != true}
    <div class="mb-2">
      <LocationSelect location={settings.location} />
    </div>
  {/if}
  <label class="label mb-2">
    <span>{m.Widgets_Weather_Settings_MeasurementUnits()}</span>
    <select class="select" bind:value={$measurementUnits}>
      <option value={MeasurementUnits.Metric}>{m.Widgets_Weather_Settings_MeasurementUnits_Metric()}</option>
      <option value={MeasurementUnits.Imperial}>{m.Widgets_Weather_Settings_MeasurementUnits_Imperial()}</option>
    </select>
  </label>
  <label class="label">
    <span>{m.Widgets_Weather_Settings_AssetPack()}</span>
    <select class="select" bind:value={$assetPack}>
      {#each AssetsPacks as pack (pack[0])}
        <option value={pack[0]}>{pack[1].name()}</option>
      {/each}
    </select>
  </label>
{:else if tab === LayoutTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$showDetails} />
    <p>{m.Widgets_Weather_Settings_Layout_ShowDetails()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$showCity} />
    <p>{m.Widgets_Weather_Settings_Layout_ShowCity()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$showAdminArea1} />
    <p>{m.Widgets_Weather_Settings_Layout_ShowAdminArea1()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$showCountry} />
    <p>{m.Widgets_Weather_Settings_Layout_ShowCountry()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$showCurrentIcon} />
    <p>{m.Widgets_Weather_Settings_Layout_ShowCurrentIcon()}</p>
  </label>
{:else if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
