<script lang="ts">
  import { MeasurementUnits, type Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import { fetchWeatherApi } from 'openmeteo';
  import { localeCharSubset } from '$stores/locale';
  import { AssetsPacks, DefaultAssetsPack } from './asset-packs';
  import { TimeOfDay } from './asset-packs/asset-pack-base';
  import pDebounce from 'p-debounce';
  import { Tab, TabGroup } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';

  let clockStore = getClockStore(60000);
  type LatestForecast = {
    lastUpdate: number;
    latitude: number;
    longitude: number;
    current: {
      temperature2m: number;
      apparentTemperature: number;
      weatherCode: number;
      timeOfDay: TimeOfDay;
    };
    hourly: {
      time: number[];
      temperature2m: number[];
      precipitationProbability: number[];
      weatherCode: number[];
    };
    daily: {
      time: number[];
      weatherCode: number[];
      temperature2mMax: number[];
      temperature2mMin: number[];
      precipitationProbabilityMax: number[];
    };
  };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_Weather_${id}_LatestForecast`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let forecast: LatestForecast;

  const fontSettings = settings.font;
  const location = settings.location;
  const textShadowSettings = settings.textShadow;
  $: {
    ($clockStore || $location) && checkIfObsoleteDebounced();
  }

  $: assetPack = (AssetsPacks.get($settings.assetPack) ?? DefaultAssetsPack).assetPack.getValue();

  $: intlTimeFormat = new Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
  });

  $: intlDateFormat = new Intl.DateTimeFormat(navigator.language, {
    day: 'numeric',
    month: 'numeric',
  });

  $: hourlyRange = forecast
    ? forecast.hourly.time
        .map((t, i) => [t, i])
        .filter(f => f[0] > $clockStore.valueOf())
        .slice(0, 12)
    : [];

  $: dailyRange = forecast
    ? forecast.daily.time
        .map((t, i) => [t, i])
        .filter(f => f[0] > $clockStore.valueOf())
        .slice(0, 14)
    : [];

  let currentTab = 0;

  onMount(async () => {
    forecast = <LatestForecast>(await storage.local.get(storageKey))[storageKey];
    try {
      await ensureLocationPresent();
    } catch (e) {
      console.error(e);
    }

    await checkIfObsoleteDebounced();
  });

  async function ensureLocationPresent() {
    if (!$location.city) {
      const response = await fetch('http://ip-api.com/json?fields=status,country,city,lat,lon').then(r => r.json());
      if (response?.status === 'success') {
        Object.assign($location, {
          city: response.city,
          country: response.country,
          latitude: response.lat,
          longitude: response.lon,
        });
        $location = $location;
      }
    }
  }

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (
      !forecast ||
      new Date().valueOf() - forecast.lastUpdate > 900_000 || // Every 15 minutes
      forecast.latitude !== $location.latitude || // Or location change
      forecast.longitude !== $location.longitude
    ) {
      await loadNewForecast();
    }
  }

  async function loadNewForecast() {
    if (!$location.city) return;
    const params = {
      latitude: $location.latitude,
      longitude: $location.longitude,
      current: ['temperature_2m', 'apparent_temperature', 'weather_code', 'is_day'],
      hourly: ['temperature_2m', 'precipitation_probability', 'weather_code'],
      daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const response = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', params);
    const current = response[0].current()!;
    const daily = response[0].daily()!;
    const hourly = response[0].hourly()!;
    const utcOffsetSeconds = response[0].utcOffsetSeconds();

    function dateRange(start: number, stop: number, step: number) {
      return Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
    }

    forecast = {
      lastUpdate: new Date().valueOf(),
      latitude: $location.latitude,
      longitude: $location.longitude,
      current: {
        temperature2m: current.variables(0)!.value(),
        apparentTemperature: current.variables(1)!.value(),
        weatherCode: current.variables(2)!.value(),
        timeOfDay: current.variables(3)!.value() > 0 ? TimeOfDay.Day : TimeOfDay.Night,
      },
      hourly: {
        time: dateRange(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
          t => (t + utcOffsetSeconds) * 1000,
        ),
        temperature2m: Array.from(hourly.variables(0)!.valuesArray()!),
        precipitationProbability: Array.from(hourly.variables(1)!.valuesArray()!),
        weatherCode: Array.from(hourly.variables(2)!.valuesArray()!),
      },
      daily: {
        time: dateRange(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
          t => (t + utcOffsetSeconds) * 1000,
        ),
        weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
        temperature2mMax: Array.from(daily.variables(1)!.valuesArray()!),
        temperature2mMin: Array.from(daily.variables(2)!.valuesArray()!),
        precipitationProbabilityMax: Array.from(daily.variables(3)!.valuesArray()!),
      },
    };
    await storage.local.set({ [storageKey]: forecast });
  }

  function adaptTemperature(metric: number, targetUnits: MeasurementUnits) {
    if (targetUnits === MeasurementUnits.Imperial) {
      return metric * 1.8 + 32;
    }

    return metric;
  }
</script>

<div
  class="w-full h-full select-none flex justify-center content-center flex-col px-[5cqmin] pt-[5cqmin] pb-[1cqmin] text-[var(--st--text-color)] text-[15cqmin] [&>*]:drop-shadow-[var(--st-shadow)]"
  style:background-color={$settings.backgroundColor}
  style:--st--text-color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  style:--st-shadow="{$textShadowSettings.offsetX}cqmin {$textShadowSettings.offsetY}cqmin {$textShadowSettings.blur}cqmin
  {$textShadowSettings.color}"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}>
  {#if forecast?.lastUpdate > 0}
    <!-- https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F14%2Fe4%2F15%2F14e4159de055c62b101844c1fe556e7b.jpg&f=1&nofb=1&ipt=dbd3824cb1e0780360de683156927cfbeef4bac863735cfca52bd46c8d0641f2&ipo=images -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <div class="grid grid-rows-[1fr,auto] grid-cols-[1fr,auto] gap-0 w-full h-full">
      <div class="row-start-1 col-start-1 row-end-1 col-end-1 flex flex-col min-h-0 min-w-0">
        <h4 class="text-[max(0.4em,10px)] leading-none">{$location.city}, {$location.country}</h4>
        <div class="min-h-0">
          <img
            class="block object-contain object-left-top w-full h-full"
            draggable="false"
            src={assetPack.getIconUrl(forecast.current.weatherCode, forecast.current.timeOfDay)} />
        </div>
      </div>
      <div class="row-start-1 col-start-2 row-end-2 col-end-3">
        <div class="text-right text-[1.3em]">
          {adaptTemperature(forecast.current.temperature2m, $settings.measurementUnits).toFixed(0)}&deg;
        </div>
        <div class="text-[max(0.4em,7px)] mt-2">
          {m.Widgets_Weather_Forecast_Current_FeelsLike()}
          {adaptTemperature(forecast.current.apparentTemperature, $settings.measurementUnits).toFixed(0)}&deg;
        </div>
      </div>
      <div class="row-start-2 col-start-1 row-end-3 col-end-3 text-[max(.3em,6px)]">
        <TabGroup
          padding="px-2 py-0"
          regionPanel="!mt-[3cqmin]"
          border="border-b border-[var(--st--text-color)]"
          active="border-b-2 border-[var(--st--text-color)]"
          hover="hover:bg-[color-mix(in_srgb,currentColor_20%,transparent)]">
          <Tab bind:group={currentTab} name="tab1" value={0}>
            <span>{m.Widgets_Weather_Forecast_Hourly()}</span>
          </Tab>
          <Tab bind:group={currentTab} name="tab1" value={1}>
            <span>{m.Widgets_Weather_Forecast_Daily()}</span>
          </Tab>
          <svelte:fragment slot="panel">
            {#if currentTab === 0}
              <div class="flex flex-row gap-1 overflow-y-auto scrollbar pb-[4cqmin]">
                {#each hourlyRange as item}
                  <div
                    title={m.Widgets_Weather_Forecast_Hourly_PrecipitationProbability({
                      percent: forecast.hourly.precipitationProbability[item[1]].toFixed(0),
                    })}
                    class="flex flex-col min-w-fit flex-grow">
                    <time class="block text-center whitespace-nowrap mx-1 leading-tight">
                      {intlTimeFormat.format(item[0])}
                    </time>
                    <div class="h-[15cqh]">
                      <img
                        class="object-contain w-full h-full"
                        draggable="false"
                        src={assetPack.getIconUrl(forecast.hourly.weatherCode[item[1]], forecast.current.timeOfDay)} />
                    </div>
                    <div class="text-center mt-auto leading-tight">
                      {adaptTemperature(forecast.hourly.temperature2m[item[1]], $settings.measurementUnits).toFixed(
                        0,
                      )}&deg;
                    </div>
                  </div>
                {/each}
              </div>
            {:else if currentTab === 1}
              <div class="flex flex-row gap-1 overflow-y-auto pb-[4cqmin]">
                {#each dailyRange as item}
                  <div
                    title={m.Widgets_Weather_Forecast_Daily_PrecipitationProbability({
                      percent: forecast.daily.precipitationProbabilityMax[item[1]].toFixed(0),
                    })}
                    class="flex flex-col min-w-fit flex-grow">
                    <time class="block text-center mx-1 leading-tight">
                      {intlDateFormat.format(item[0])}
                    </time>
                    <div class="h-[15cqh]">
                      <img
                        class="object-contain w-full h-full"
                        draggable="false"
                        src={assetPack.getIconUrl(forecast.daily.weatherCode[item[1]], forecast.current.timeOfDay)} />
                    </div>
                    <div class="text-center mt-auto leading-tight">
                      {adaptTemperature(forecast.daily.temperature2mMin[item[1]], $settings.measurementUnits).toFixed(
                        0,
                      )}-{adaptTemperature(
                        forecast.daily.temperature2mMax[item[1]],
                        $settings.measurementUnits,
                      ).toFixed(0)}&deg;
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </svelte:fragment>
        </TabGroup>
      </div>
    </div>
  {:else}
    <div class="w-full !h-full placeholder animate-pulse !rounded-[inherit]" />
  {/if}
</div>
