<script lang="ts">
  import type { CryptoAssetRef, Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { browserLocales, userPosssibleLocaleCharSubset } from '$stores/locale';
  import pDebounce from 'p-debounce';
  import type { CoincapioAssetHistoryResponse, CoincapioAssetResponse } from './types/coincapio';
  import { storage } from '$stores/storage';
  import { differenceInMinutes, minutesToMilliseconds } from 'date-fns';
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
  import { textStroke } from '$actions/text-stroke';

  ChartJS.register(LineElement, LinearScale, CategoryScale, PointElement, Tooltip, Legend);

  let { settings, id }: { settings: Settings; id: string } = $props();

  let currentExchangeRate = $derived(
    settings.displayCurrency.value === 'USD' ? 1 : ($exchangeRates || {})[settings.displayCurrency.value] || 1,
  );

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

  let priceInfo: PriceInfo | undefined = $state();
  let chart: ChartJS<'line', number[], unknown> | undefined = $state();

  let currencyFormatter = $derived(
    new Intl.NumberFormat(
      browserLocales.map(m => m.toString()),
      { style: 'currency', currency: settings.displayCurrency.value },
    ),
  );
  const dateFormatter = new Intl.DateTimeFormat(
    browserLocales.map(m => m.toString()),
    { dateStyle: 'medium', timeStyle: 'medium' },
  );

  let currentTab = $state(HistoryTab.Daily);

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

  $effect(() => {
    if (chart && chart?.data.datasets?.length > 0) {
      const historyData = historyDataForTab(priceInfo, currentTab);
      chart.data.labels = historyData.map(m => dateFormatter.format(m.date));
      chart.data.datasets[0].data = historyData.map(m => m.price * currentExchangeRate);
      chart.update();
    }
  });

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
          color: settings.chartAxisColor.value,
        },
      },
    },
  } satisfies ChartOptions<'line'>;

  $effect(() => {
    (settings.asset.value || $clockStore) && updateDebounced();
  });

  $effect(() => {
    if (chart && chart?.data.datasets?.length > 0) {
      chart.data.datasets[0].borderColor = settings.chartLineColor.value;
      chart.data.datasets[0].backgroundColor = settings.chartLineColor.value;
      chart.update();
    }
  });

  $effect(() => {
    if (chart?.options.scales) {
      chart.options.scales!.y!.grid!.color = settings.chartAxisColor.value;
      chart.update();
    }
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  async function update() {
    if (!priceInfo) {
      priceInfo = <PriceInfo>(await storage.local.get(storageKey))[storageKey];
    }
    if (!settings.asset.value) {
      return;
    }
    if (
      navigator.onLine &&
      (!priceInfo ||
        differenceInMinutes(Date.now(), priceInfo.lastUpdate) > 5 ||
        priceInfo.asset.id !== settings.asset.value.id)
    ) {
      const promises = [
        fetch(`https://api.coincap.io/v2/assets/${settings.asset.value.id}`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${settings.asset.value.id}/history?interval=d1`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${settings.asset.value.id}/history?interval=h1`).then(r => r.json()),
        fetch(`https://api.coincap.io/v2/assets/${settings.asset.value.id}/history?interval=m1`).then(r => r.json()),
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
        asset: settings.asset.value,
      };
      await storage.local.set({ [storageKey]: priceInfo });
    }
  }

  const updateDebounced = pDebounce(update, 500);

  function historyDataForTab(info: PriceInfo | undefined | null, tab: HistoryTab) {
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
  class="w-full h-full p-[5cqmin] select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] text-[var(--st--text-color)] text-[9cqmin] [&>*]:drop-shadow-[var(--st-shadow)] [&_*]:[-webkit-text-stroke:var(--sv-text-stroke)]"
  style:background-color={settings.backgroundColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:--st--text-color={settings.textColor.value}
  style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  class:placeholder={!priceInfo}
  use:fontsource={{
    font: settings.font.id.value,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
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
