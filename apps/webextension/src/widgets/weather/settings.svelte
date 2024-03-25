<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { MeasurementUnits, type Settings } from './settings';
  import { TextTabId, BackgroundTabId, LayoutTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import LocationSelect from './location-select.svelte';
  import { AssetsPacks } from './asset-packs';

  export let settings: Settings;
  export let tab: number;

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
  <div class="label mb-2">
    <span>{m.Widgets_Weather_Settings_Font()}</span>
    <FontSelector {font} bind:color={$textColor} />
  </div>
  <div class="mt-2">
    <h4>{m.Widgets_Weather_Settings_Shadow()}</h4>
    <div class="pl-4 pr-4">
      <ShadowSelector shadowSettings={settings.textShadow} />
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Weather_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Weather_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
