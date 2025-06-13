<script lang="ts" module>
  type HistoryPrice = { price: number; date: number };

  type PriceInfo = {
    lastUpdate: number;
    hourHistoryPrices: HistoryPrice[];
    dayHistoryPrices: HistoryPrice[];
    monthHistoryPrices: HistoryPrice[];
    yearHistoryPrices: HistoryPrice[];
    currentPrice: number;
    asset: CryptoAssetRef;
  };

  const enum HistoryTab {
    Day = 0,
    Hour = 1,
    Month = 2,
    Year = 3,
  }
</script>

<script lang="ts">
  import type { CryptoAssetRef, Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { browserLocales, userPosssibleLocaleCharSubset } from '$stores/locale';
  import pDebounce from 'p-debounce';
  import { getAsset, getAssetHistory } from './livecoinwatch-api';
  import { storage } from '$stores/storage';
  import { addDays, addHours, addMonths, addYears, differenceInMinutes, minutesToMilliseconds } from 'date-fns';
  import { getClockStore } from '$stores/clock-store';
  import { Tab, TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
  import { Chart } from 'svelte-echarts';
  import { init, use, type ComposeOption } from 'echarts/core';
  import { type LineSeriesOption, LineChart } from 'echarts/charts';
  import {
    GridComponent,
    TooltipComponent,
    type GridComponentOption,
    type TooltipComponentOption,
  } from 'echarts/components';
  import { SVGRenderer } from 'echarts/renderers';
  import * as m from '$i18n/messages';
  import { onMount } from 'svelte';
  import { exchangeRates } from './exchange-rate-store';
  import { textStroke } from '$actions/text-stroke';

  use([GridComponent, SVGRenderer, TooltipComponent, LineChart]);

  let { settings, id }: { settings: Settings; id: string } = $props();

  let currentExchangeRate = $derived(
    settings.displayCurrency.value === 'USD' ? 1 : ($exchangeRates || {})[settings.displayCurrency.value] || 1,
  );

  const storageKey = `Widget_CryptoAssets_${id}_LastPriceInfo`;
  let clockStore = getClockStore(minutesToMilliseconds(1));

  let priceInfo: PriceInfo | undefined = $state();

  let currencyFormatter = $derived(
    new Intl.NumberFormat(
      browserLocales.map(x => x.toString()),
      { style: 'currency', currency: settings.displayCurrency.value },
    ),
  );
  const dateFormatter = new Intl.DateTimeFormat(
    browserLocales.map(x => x.toString()),
    { dateStyle: 'medium', timeStyle: 'medium' },
  );

  let currentTab = $state(HistoryTab.Day);
  let chartAnimationDuration = 0;
  let chartGlobalCursorPosition = { x: 0, y: 0 };

  let chartOptions: any = $derived<ComposeOption<GridComponentOption | TooltipComponentOption | LineSeriesOption>>({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `<strong class="text-[clamp(8px,.75em,24px)]">${dateFormatter.format(params[0].data[0])}</strong><br /><center class="mt-1 text-[clamp(10px,1em,26px)]">${currencyFormatter.format(params[0].data[1])}</center>`;
      },
      className: '!p-[clamp(3px,.5em,10px)] !card !text-token !border-none',
      appendTo() {
        return document.body;
      },
      position: function (point, params, dom, rect, size) {
        let [tooltipWidth, tooltipHeight]: [number, number] = size.contentSize;

        if (dom instanceof HTMLElement) {
          tooltipWidth = dom.offsetWidth;
          tooltipHeight = dom.offsetHeight;
        } else {
          [tooltipWidth, tooltipHeight] = size.contentSize;
        }

        const padY = -tooltipHeight - 5;
        const padX = -tooltipWidth / 2;

        let [left, top] = point;
        top += padY;
        left += padX;

        if (chartGlobalCursorPosition.x + tooltipWidth + padX > document.body.clientWidth) {
          left -= chartGlobalCursorPosition.x + tooltipWidth + padX - document.body.clientWidth;
        }

        if (chartGlobalCursorPosition.x - tooltipWidth - padX < 0) {
          left += tooltipWidth + padX - chartGlobalCursorPosition.x;
        }

        if (chartGlobalCursorPosition.y + tooltipHeight + padY > document.body.clientHeight) {
          top -= chartGlobalCursorPosition.y + tooltipHeight + padY - document.body.clientHeight;
        }

        if (chartGlobalCursorPosition.y - tooltipHeight - padY < 0) {
          top += tooltipHeight + padY - chartGlobalCursorPosition.y;
        }

        return [left, top];
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: [0, 0],
      axisPointer: {
        lineStyle: {
          color: settings.chartLineColor.value,
        },
      },
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      splitLine: {
        lineStyle: {
          color: settings.chartAxisColor.value,
        },
      },
    },
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    series: [
      {
        name: settings.asset.value?.name,
        type: 'line',
        smooth: false,
        symbol: 'none',
        areaStyle: {
          color: settings.chartFillAreaColor.value,
          opacity: 1,
        },
        animation: true,
        animationDuration: () => chartAnimationDuration,
        color: settings.chartLineColor.value,
        data: historyDataForTab(priceInfo, currentTab).map(x => [
          x.date,
          calculatePriceInCurrency(x.price, currentExchangeRate),
        ]),
      },
    ],
  });

  $effect(() => {
    settings.asset.value;
    $clockStore;
    settings.apiKey.value;
    updateDebounced();
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  async function update() {
    if (!priceInfo) {
      priceInfo = <PriceInfo>(await storage.local.get(storageKey))[storageKey];
    }
    if (priceInfo) {
      if (priceInfo.dayHistoryPrices === undefined) {
        priceInfo.dayHistoryPrices = [];
      }
      if (priceInfo.hourHistoryPrices === undefined) {
        priceInfo.hourHistoryPrices = [];
      }
      if (priceInfo.monthHistoryPrices === undefined) {
        priceInfo.monthHistoryPrices = [];
      }
      if (priceInfo.yearHistoryPrices === undefined) {
        priceInfo.yearHistoryPrices = [];
      }
    }
    if (!settings.asset.value || !settings.apiKey.value) {
      return;
    }
    if (
      navigator.onLine &&
      (!priceInfo ||
        differenceInMinutes(Date.now(), priceInfo.lastUpdate) > 5 ||
        priceInfo.asset.id !== settings.asset.value.id)
    ) {
      const historyDataEnd = Date.now();
      const [assetData, yearHistoryData, monthHistoryData, dayHistoryData, hourHistoryData] = await Promise.all([
        getAsset(settings.asset.value.id, settings.apiKey.value),
        getAssetHistory(settings.asset.value.id, settings.apiKey.value, addYears(historyDataEnd, -1).getTime()),
        getAssetHistory(settings.asset.value.id, settings.apiKey.value, addMonths(historyDataEnd, -1).getTime()),
        getAssetHistory(settings.asset.value.id, settings.apiKey.value, addDays(historyDataEnd, -1).getTime()),
        getAssetHistory(settings.asset.value.id, settings.apiKey.value, addHours(historyDataEnd, -1).getTime()),
      ]);

      priceInfo = {
        lastUpdate: Date.now(),
        currentPrice: assetData.rate,
        yearHistoryPrices:
          yearHistoryData?.history?.map(d => ({
            price: d.rate,
            date: d.date,
          })) || [],
        monthHistoryPrices:
          monthHistoryData?.history?.map(d => ({
            price: d.rate,
            date: d.date,
          })) || [],
        dayHistoryPrices:
          dayHistoryData?.history?.map(d => ({
            price: d.rate,
            date: d.date,
          })) || [],
        hourHistoryPrices:
          hourHistoryData?.history?.map(d => ({
            price: d.rate,
            date: d.date,
          })) || [],
        asset: settings.asset.value,
      };
      await storage.local.set({ [storageKey]: $state.snapshot(priceInfo) });
    }
  }

  const updateDebounced = pDebounce(update, 500);

  function historyDataForTab(info: PriceInfo | undefined | null, tab: HistoryTab) {
    if (!info) return [];
    switch (tab) {
      case HistoryTab.Day:
        return info.dayHistoryPrices || [];
      case HistoryTab.Hour:
        return info.hourHistoryPrices || [];
      case HistoryTab.Month:
        return info.monthHistoryPrices || [];
      case HistoryTab.Year:
        return info.yearHistoryPrices || [];
      default:
        return [];
    }
  }

  onMount(() => {
    update();
    setTimeout(() => (chartAnimationDuration = 500), 500);
  });

  function onChartMouseMove(event: MouseEvent) {
    chartGlobalCursorPosition.x = event.pageX;
    chartGlobalCursorPosition.y = event.pageY;
  }

  function calculatePriceInCurrency(price: number, exchangeRate: number) {
    if (!price || !exchangeRate) return 0;
    if (exchangeRate === 0) return 0;
    if (Math.abs(exchangeRate - 1.0) > Number.EPSILON) {
      return price * exchangeRate;
    }

    return price;
  }
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
  {#if !settings.apiKey.value}
    <div class="w-full h-full flex justify-center items-center">
      <p class="w-full text-center">{m.Widgets_CryptoAssetQuotation_NoApiKey()}</p>
    </div>
  {:else if priceInfo}
    <p class="mb-1 text-[max(0.5em,12px)] current-price">
      {priceInfo.asset.name} ({priceInfo.asset.code}):&nbsp;
      <span class="font-medium">
        {currencyFormatter.format(calculatePriceInCurrency(priceInfo.currentPrice, currentExchangeRate))}
      </span>
    </p>
    <div
      class="w-full flex-1 min-h-0 text-[max(.3em,8px)] [&>.tab-group]:h-full [&>.tab-group]:flex [&>.tab-group]:flex-col">
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <TabGroup
        padding="px-2 py-0"
        regionPanel="!mt-[3cqmin] min-h-0 flex-1"
        border="border-b border-[var(--st--text-color)]"
        active="border-b-2 border-[var(--st--text-color)]"
        hover="hover:bg-[color-mix(in_srgb,currentColor_20%,transparent)]">
        <Tab bind:group={currentTab} name="Widget_{id}_tab_hour" value={HistoryTab.Hour}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Hour()}</span>
        </Tab>
        <Tab bind:group={currentTab} name="Widget_{id}_tab_day" value={HistoryTab.Day}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Day()}</span>
        </Tab>
        <Tab bind:group={currentTab} name="Widget_{id}_tab_month" value={HistoryTab.Month}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Month()}</span>
        </Tab>
        <Tab bind:group={currentTab} name="Widget_{id}_tab_year" value={HistoryTab.Year}>
          <span>{m.Widgets_CryptoAssetQuotation_Quotation_Year()}</span>
        </Tab>
        <TabAnchor
          href="https://www.livecoinwatch.com/price/{priceInfo.asset.name}-{priceInfo.asset.id}"
          rel="noreferrer"
          referrerpolicy="no-referrer">
          {m.Widgets_CryptoAssetQuotation_Quotation_Details()}
          <span class="icon-[heroicons-solid--external-link]"></span>
        </TabAnchor>
        <svelte:fragment slot="panel">
          <div class="w-full h-full chart" onmousemove={onChartMouseMove}>
            <Chart {init} options={chartOptions} />
          </div>
        </svelte:fragment>
      </TabGroup>
    </div>
  {/if}
</div>
