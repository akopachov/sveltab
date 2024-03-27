<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { AirQualityLegislation, AirQualityVariables, type Settings } from './settings';
  import { TextTabId, BackgroundTabId, VariablesTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import LocationSelect from '$shared-components/location-select.svelte';

  export let settings: Settings;
  export let tab: number;

  const { legislation, font, textColor, backgroundBlur, backgroundColor, queryUserLocation, showVariables } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" bind:checked={$queryUserLocation} />
    <p>{m.Widgets_AirQuality_Settings_Location_QueryBrowser()}</p>
  </label>
  {#if $queryUserLocation != true}
    <div class="mb-2">
      <LocationSelect location={settings.location} />
    </div>
  {/if}
  <label class="label mb-2">
    <span>{m.Widgets_AirQuality_Settings_Legislation()}</span>
    <select class="select" bind:value={$legislation}>
      <option value={AirQualityLegislation.European}>{m.Widgets_AirQuality_Settings_Legislation_European()}</option>
      <option value={AirQualityLegislation.USA}>{m.Widgets_AirQuality_Settings_Legislation_USA()}</option>
    </select>
  </label>
{:else if tab == VariablesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.PM2_5} bind:group={$showVariables} />
    <p>
      PM
      <sub>2.5</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.PM10} bind:group={$showVariables} />
    <p>
      PM
      <sub>10</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.CarbonMonoxide} bind:group={$showVariables} />
    <p>CO</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.NitrogenDioxide} bind:group={$showVariables} />
    <p>
      NO
      <sub>2</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.SulfurDioxide} bind:group={$showVariables} />
    <p>
      SO
      <sub>2</sub>
    </p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={AirQualityVariables.Ozone} bind:group={$showVariables} />
    <p>
      O
      <sub>3</sub>
    </p>
  </label>
{:else if tab === TextTabId}
  <div class="label mb-2">
    <span>{m.Widgets_AirQuality_Settings_Font()}</span>
    <FontSelector {font} bind:color={$textColor} />
  </div>
  <div class="mt-2">
    <h4>{m.Widgets_AirQuality_Settings_Shadow()}</h4>
    <div class="pl-4 pr-4">
      <ShadowSelector shadowSettings={settings.textShadow} />
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_AirQuality_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_AirQuality_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
