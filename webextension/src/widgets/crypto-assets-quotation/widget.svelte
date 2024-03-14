<script lang="ts">
  import type { CryptoAssetRef, Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { browserLocales, userPosssibleLocaleCharSubset } from '$stores/locale';
  import pDebounce from 'p-debounce';
  import type { CoincapioAssetHistoryResponse, CoincapioAssetResponse } from './types/coincapio';
  import { storage } from '$stores/storage';
  import { minutesToMilliseconds } from 'date-fns';
  import { getClockStore } from '$stores/clock-store';
  import { Line } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions,
  } from 'chart.js';
  import { Tab, TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { onMount } from 'svelte';
  import { exchangeRates } from './exchange-rate-store';

  ChartJS.register(LineElement, LinearScale, CategoryScale, PointElement, Tooltip, Legend);

  export let settings: Settings;
  export let id: string;

  $: currentExchangeRate = $displayCurrency === 'USD' ? 1 : ($exchangeRates || {})[$displayCurrency] || 1;

  const storageKey = `Widget_CryptoAssets_${id}_LastPriceInfo`;
  let clockStore = getClockStore(minutesToMilliseconds(1));

  type HistoryPrice = { price: number; date: number };

  type PriceInfo = {
    lastUpdate: number;
    dailyHistoryPrices: HistoryPrice[];
    hourlyHistoryPrices: HistoryPrice[];
    minutelyHistoryPrices: HistoryPrice[];
    currentPrice: number;
    asset: CryptoAssetRef;
  };

  enum HistoryTab {
    Daily = 0,
    Hourly = 1,
    Minutely = 2,
  }

  let priceInfo: PriceInfo;
  let chart: ChartJS<'line', number[], unknown>;

  const {
    asset,
    chartLineColor,
    chartAxisColor,
    displayCurrency,
    backgroundColor,
    backgroundBlur,
    textColor,
    font: { id: fontId, weight: fontWeight },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
  } = settings;

  $: currencyFormatter = new Intl.NumberFormat(
    browserLocales.map(m => m.toString()),
    { style: 'currency', currency: $displayCurrency },
  );
  const dateFormatter = new Intl.DateTimeFormat(
    browserLocales.map(m => m.toString()),
    { dateStyle: 'medium', timeStyle: 'medium' },
  );

  let currentTab = HistoryTab.Daily;

  const chartData = {
    labels: [],
    datasets: [
      {
        label: '',
        backgroundColor: 'rgb(205, 130, 158)',
        fill: false,
        borderColor: 'rgb(255, 130, 158)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgb(0, 0, 0)',
        pointHoverBorderColor: 'rgba(220, 220, 220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
        data: [],
      },
    ],
  } satisfies ChartData<'line', number[], unknown>;

  $: {
    if (chart?.data.datasets?.length > 0) {
      const historyData = historyDataForTab(priceInfo, currentTab);
      chart.data.labels = historyData.map(m => dateFormatter.format(m.date));
      chart.data.datasets[0].data = historyData.map(m => m.price * currentExchangeRate);
      chart.update();
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            return tooltipItem.yLabel;
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        ticks: {
          display: false,
        },
        grid: {
          color: $chartAxisColor,
        },
      },
    },
  } satisfies ChartOptions<'line'>;

  $: {
    ($asset || $clockStore) && updateDebounced();
  }

  $: {
    if (chart?.data.datasets?.length > 0) {
      chart.data.datasets[0].borderColor = $chartLineColor;
      chart.data.datasets[0].backgroundColor = $chartLineColor;
      chart.update();
    }
  }

  $: {
    if (chart?.options.scales) {
      chart.options.scales!.y!.grid!.color = $chartAxisColor;
      chart.update();
    }
  }

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  async function update() {
    if (!$asset) {
      return;
    }
    if (!priceInfo) {
      priceInfo = (await storage.local.get(storageKey))[storageKey];
    }
    if (
      !priceInfo ||
      Date.now() - priceInfo.lastUpdate > minutesToMilliseconds(5) ||
      priceInfo.asset.id !== $asset.id
    ) {
      const promises = [
        fetch(`https://api.coincap.io/v2/assets/${$asset.id}`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${$asset.id}/history?interval=d1`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${$asset.id}/history?interval=h1`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${$asset.id}/history?interval=m1`).then(r => r.json()),
      ];
      let [assetData, dailyHistoryData, hourlyHistoryData, minutelyHistoryData] = <
        [
          CoincapioAssetResponse,
          CoincapioAssetHistoryResponse,
          CoincapioAssetHistoryResponse,
          CoincapioAssetHistoryResponse,
        ]
      >await Promise.all(promises);

      priceInfo = {
        lastUpdate: Date.now(),
        currentPrice: assetData.data.priceUsd,
        dailyHistoryPrices: dailyHistoryData.data.map(m => ({
          price: m.priceUsd,
          date: m.time,
        })),
        hourlyHistoryPrices: hourlyHistoryData.data.map(m => ({
          price: m.priceUsd,
          date: m.time,
        })),
        minutelyHistoryPrices: minutelyHistoryData.data.map(m => ({
          price: m.priceUsd,
          date: m.time,
        })),
        asset: $asset,
      };
      await storage.local.set({ [storageKey]: priceInfo });
    }
  }

  const updateDebounced = pDebounce(update, 500);

  function historyDataForTab(info: PriceInfo, tab: HistoryTab) {
    if (!info) return [];
    switch (tab) {
      case HistoryTab.Daily:
        return info.dailyHistoryPrices;
      case HistoryTab.Hourly:
        return info.hourlyHistoryPrices;
      case HistoryTab.Minutely:
        return info.minutelyHistoryPrices;
      default:
        return [];
    }
  }

  onMount(() => update());
</script>

<div
  class="w-full h-full p-[5cqmin] select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] text-[var(--st--text-color)] text-[9cqmin] [&>*]:drop-shadow-[var(--st-shadow)]"
  style:background-color={$backgroundColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:--st--text-color={$textColor}
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  class:placeholder={!priceInfo}
  use:fontsource={{
    font: $fontId,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}>
  {#if priceInfo}
    <p class="mb-1 text-[max(0.5em,12px)]">
      {priceInfo.asset.name} ({priceInfo.asset.code}):&nbsp;
      <span class="font-medium">{currencyFormatter.format(priceInfo.currentPrice * currentExchangeRate)}</span>
    </p>
    <div
      class="w-full flex-1 min-h-0 text-[max(.3em,8px)] [&>.tab-group]:h-full [&>.tab-group]:flex [&>.tab-group]:flex-col">
      <TabGroup
        padding="px-2 py-0"
        regionPanel="!mt-[3cqmin] min-h-0 flex-1"
        border="border-b border-[var(--st--text-color)]"
        active="border-b-2 border-[var(--st--text-color)]"
        hover="hover:bg-[color-mix(in_srgb,currentColor_20%,transparent)]">
        <Tab bind:group={currentTab} name="Widget_{id}_tab_daily" value={HistoryTab.Daily}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Daily()}</span>
        </Tab>
        <Tab bind:group={currentTab} name="Widget_{id}_tab_hourly" value={HistoryTab.Hourly}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Hourly()}</span>
        </Tab>
        <Tab bind:group={currentTab} name="Widget_{id}_tab_minutely" value={HistoryTab.Minutely}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Minutely()}</span>
        </Tab>
        <TabAnchor href="https://coincap.io/assets/{priceInfo.asset.id}" rel="noreferrer" referrerpolicy="no-referrer">
          {m.Widgets_CryptoAssetQuotation_Quotation_Details()}
          <span class="icon-[heroicons-solid--external-link]"></span>
        </TabAnchor>
        <svelte:fragment slot="panel">
          <div class="w-full h-full">
            <Line data={chartData} options={chartOptions} bind:chart />
          </div>
        </svelte:fragment>
      </TabGroup>
    </div>
  {/if}
</div>
