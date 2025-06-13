<script module lang="ts">
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
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let currencyName = $derived(new Intl.DisplayNames($locale, { type: 'currency' }));

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="label">
    <span>
      {m.Widgets_CryptoAssetQuotation_Settings_ApiKey()}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <a
        href="https://splash.coincap.io/"
        target="_blank"
        referrerpolicy="no-referrer"
        class="anchor icon-[gridicons--external]">
      </a>
    </span>
    <input type="password" class="input" bind:value={settings.apiKey.value} />
  </label>
  <div>
    <AssetSelect bind:asset={settings.asset.value} apiKey={settings.apiKey.value} />
  </div>
  <label class="label mb-2">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_DisplayCurrency()}</span>
    <select class="select" bind:value={settings.displayCurrency.value}>
      {#each ExchangerateApiSupportedCurrencies as currencyCode}
        <option value={currencyCode}>{currencyName.of(currencyCode)}</option>
      {/each}
    </select>
  </label>
{:else if tab === ChartTabId}
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Chart_LineColor()}</span>
    <div>
      <ColorPicker bind:color={settings.chartLineColor.value} />
    </div>
  </div>
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Chart_AxisColor()}</span>
    <div>
      <ColorPicker bind:color={settings.chartAxisColor.value} />
    </div>
  </div>
  <div class="label">
    <span>{m.Widgets_CryptoAssetQuotation_Settings_Chart_AreaFillColor()}</span>
    <div>
      <ColorPicker bind:color={settings.chartFillAreaColor.value} />
    </div>
  </div>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
