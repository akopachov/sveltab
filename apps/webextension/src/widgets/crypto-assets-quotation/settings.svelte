<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { TextTabId, BackgroundTabId, ChartTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import AssetSelect from './asset-select.svelte';
  import { ExchangerateApiSupportedCurrencies } from './types/exchangerate';
  import { locale } from '$stores/locale';

  export let settings: Settings;
  export let tab: number;

  const { font, textColor, backgroundColor, backgroundBlur, asset, chartLineColor, displayCurrency, chartAxisColor } =
    settings;

  $: currencyName = new Intl.DisplayNames($locale, { type: 'currency' });
</script>

{#if tab === GeneralTabId}
  <div>
    <AssetSelect bind:asset={$asset} />
  </div>
  <label class="label mb-2">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_DisplayCurrency()}</span>
    <select class="select" bind:value={$displayCurrency}>
      {#each ExchangerateApiSupportedCurrencies as currencyCode}
        <option value={currencyCode}>{currencyName.of(currencyCode)}</option>
      {/each}
    </select>
  </label>
{:else if tab === ChartTabId}
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Chart_LineColor()}</span>
    <div>
      <ColorPicker bind:color={$chartLineColor} />
    </div>
  </div>
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Chart_AxisColor()}</span>
    <div>
      <ColorPicker bind:color={$chartAxisColor} />
    </div>
  </div>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_CryptoAssetQuotation_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
    <div>
      <h4>{m.Widgets_CryptoAssetQuotation_Settings_Shadow()}</h4>
      <div class="pl-4 pr-4">
        <ShadowSelector shadowSettings={settings.textShadow} />
      </div>
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
