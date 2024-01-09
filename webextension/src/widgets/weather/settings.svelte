<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { MeasurementUnits, type Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import LocationSelect from './location-select.svelte';
  import { AssetsPacks } from './asset-packs';

  export let settings: Settings;
  export let tab: number;

  const { measurementUnits, assetPack, font, textColor, backgroundBlur, backgroundColor } = settings;
</script>

{#if tab === GeneralTabId}
  <LocationSelect location={settings.location} />
  <label class="label my-2">
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
