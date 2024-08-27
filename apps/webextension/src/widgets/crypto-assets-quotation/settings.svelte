<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const ChartTabId = 1;
  const TextTabId = 2;
  const BackgroundTabId = 3;
  const Tabs = [
    {
      id: ChartTabId,
      title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Chart(),
    },
    {
      id: TextTabId,
      title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import type { Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import AssetSelect from './asset-select.svelte';
  import { ExchangerateApiSupportedCurrencies } from './types/exchangerate';
  import { locale } from '$stores/locale';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

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
  <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
