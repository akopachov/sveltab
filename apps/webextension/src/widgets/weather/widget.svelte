<script lang="ts">
  import { MeasurementUnits, type Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { createEventDispatcher, onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import { fetchWeatherApi } from 'openmeteo';
  import { localeCharSubset } from '$stores/locale';
  import { AssetsPacks, DefaultAssetsPack } from './asset-packs';
  import { TimeOfDay } from './asset-packs/asset-pack-base';
  import pDebounce from 'p-debounce';
  import { Tab, TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { imgSrcEx } from '$actions/img-src-ex';
  import { debouncedDerived } from '$stores/debounce-store';
  import { isSameDay, minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';
  import { logger } from '$lib/logger';
  import { loadingPlaceholder } from '$actions/loading-placeholder';
  import {
    getDefaultFallbackGeolocation,
    getIpGeolocation,
    getBrowserGeolocation,
    getPrecision,
    compareCoordinates,
    reverseGeocode,
  } from '$lib/geolocation';
  import { getRedirectUrl } from './owm-redirect.gen';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Weather'] });
  const dispatch = createEventDispatcher();

  let clockStore = getClockStore(minutesToMilliseconds(1));
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
      timeOfDay: TimeOfDay[];
    };
    daily: {
      time: number[];
      weatherCode: number[];
      temperature2mMax: number[];
      temperature2mMin: number[];
      precipitationProbabilityMax: number[];
      sunrise: number[];
      sunset: number[];
    };
  };
  export let settings: Settings;
  export let id: string;

  const {
    location: { latitude, longitude, city, country, admin1, admin2 },
    assetPack: assetPackId,
    textColor,
    backgroundBlur,
    backgroundColor,
    measurementUnits,
    queryUserLocation,
    font: { id: fontId, weight: fontWeight },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    showDetails,
    showCity,
    showAdminArea1,
    showCountry,
    showCurrentIcon,
  } = settings;

  const storageKey = `Widget_Weather_${id}_LatestForecast`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let forecast: LatestForecast;

  $: {
    ($clockStore || $latitude || $longitude) && checkIfObsoleteDebounced();
  }

  $: {
    $queryUserLocation && queryUserGeolocation();
  }

  $: weatherDetailsLink = getRedirectUrl($city, $country, $latitude, $longitude);

  $: assetPack = (AssetsPacks.get($assetPackId) ?? DefaultAssetsPack).assetPack.value;

  const debouncedTextColor = debouncedDerived(textColor, 300);

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

  $: locationDisplayText = [
    $city && $showCity ? $city : '',
    $admin1 && $showAdminArea1 ? $admin1 : '',
    $country && $showCountry ? $country : '',
  ]
    .filter(Boolean)
    .join(', ');

  let currentTab = 0;

  onMount(() => {
    ensureLocationPresent();
  });

  async function ensureLocationPresent() {
    if (!$city) {
      try {
        ({
          city: $city,
          country: $country,
          latitude: $latitude,
          longitude: $longitude,
          admin1: $admin1,
          admin2: $admin2,
        } = await getIpGeolocation());
      } catch (e) {
        log.error('An error occurred during querying GeoIP info', { widgetId: id }, e);
      }

      if (!$city && !$queryUserLocation) {
        // If unabled to geolocate by some reason - default to my home town
        ({
          city: $city,
          country: $country,
          latitude: $latitude,
          longitude: $longitude,
          admin1: $admin1,
          admin2: $admin2,
        } = getDefaultFallbackGeolocation());
      }
    }
  }

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (!forecast) {
      forecast = <LatestForecast>(await storage.local.get(storageKey))[storageKey];
    }

    if (
      !forecast ||
      Date.now() - forecast.lastUpdate > minutesToMilliseconds(15) || // Every 15 minutes
      forecast.latitude !== $latitude || // Or location change
      forecast.longitude !== $longitude
    ) {
      await loadNewForecast();
    }
  }

  async function queryUserGeolocation() {
    try {
      const position = await getBrowserGeolocation();
      const precision = getPrecision(position.accuracy);
      if (!compareCoordinates(position, { latitude: $latitude, longitude: $longitude }, precision)) {
        ({ admin1: $admin1, admin2: $admin2, city: $city, country: $country } = await reverseGeocode(position));

        $latitude = position.latitude;
        $longitude = position.longitude;
        dispatch('autosettingsupdate', { id, settings });
      }
    } catch (e) {
      log.warn("An error ocurred during querying user's geolocation", e);
    }
  }

  async function loadNewForecast() {
    if (!$city || !navigator.onLine) return;
    const params = {
      latitude: $latitude,
      longitude: $longitude,
      current: ['temperature_2m', 'apparent_temperature', 'weather_code', 'is_day'],
      hourly: ['temperature_2m', 'precipitation_probability', 'weather_code'],
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'sunrise',
        'sunset',
      ],
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

    const dailyTimeRange = dateRange(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(t =>
      secondsToMilliseconds(t + utcOffsetSeconds),
    );

    const hourlyTimeRange = dateRange(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(t =>
      secondsToMilliseconds(t + utcOffsetSeconds),
    );

    const dailySunrise = Array.from({ length: daily.variables(4)!.valuesInt64Length() }, (_, i) =>
      secondsToMilliseconds(Number(daily.variables(4)!.valuesInt64(i)!)),
    );

    const dailySunset = Array.from({ length: daily.variables(5)!.valuesInt64Length() }, (_, i) =>
      secondsToMilliseconds(Number(daily.variables(5)!.valuesInt64(i)!)),
    );

    forecast = {
      lastUpdate: Date.now(),
      latitude: $latitude,
      longitude: $longitude,
      current: {
        temperature2m: current.variables(0)!.value(),
        apparentTemperature: current.variables(1)!.value(),
        weatherCode: current.variables(2)!.value(),
        timeOfDay: current.variables(3)!.value() > 0 ? TimeOfDay.Day : TimeOfDay.Night,
      },
      hourly: {
        time: hourlyTimeRange,
        temperature2m: Array.from(hourly.variables(0)!.valuesArray()!),
        precipitationProbability: Array.from(hourly.variables(1)!.valuesArray()!),
        weatherCode: Array.from(hourly.variables(2)!.valuesArray()!),
        timeOfDay: hourlyTimeRange.map(time => {
          const index = dailyTimeRange.findIndex(f => isSameDay(time, f));
          if (time >= dailySunrise[index] && time <= dailySunset[index]) {
            return TimeOfDay.Day;
          }

          return TimeOfDay.Night;
        }),
      },
      daily: {
        time: dailyTimeRange,
        weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
        temperature2mMax: Array.from(daily.variables(1)!.valuesArray()!),
        temperature2mMin: Array.from(daily.variables(2)!.valuesArray()!),
        precipitationProbabilityMax: Array.from(daily.variables(3)!.valuesArray()!),
        sunrise: dailySunrise,
        sunset: dailySunset,
      },
    };
    await storage.local.set({ [storageKey]: forecast });
  }

  function adaptTemperature(metric: number, targetUnits: MeasurementUnits) {
    if (targetUnits === MeasurementUnits.Imperial) {
      return metric * 1.8 + 32;
    }

    return Math.round(metric).toFixed(0);
  }
</script>

<div
  class="w-full h-full select-none flex justify-center content-center flex-col px-[5cqmin] pt-[5cqmin] {$showDetails
    ? 'pb-[1cqmin]'
    : 'pb-[5cqmin]'} text-[var(--st--text-color)] text-[15cqmin] [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] rounded-[inherit]"
  style:background-color={$backgroundColor}
  style:--st--text-color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  use:loadingPlaceholder={forecast?.lastUpdate > 0}
  use:fontsource={{
    font: $fontId,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}>
  {#if forecast?.lastUpdate > 0}
    <div class="grid grid-rows-[1fr,auto] grid-cols-[1fr,auto] gap-0 w-full h-full">
      <div class="row-start-1 col-start-1 row-end-1 col-end-1 flex flex-col min-h-0 min-w-0">
        <h4 class="{$showDetails ? 'text-[max(0.4em,10px)]' : 'text-[max(1em,10px)]'} leading-none">
          {locationDisplayText}
        </h4>
        {#if $showCurrentIcon}
          <div class="min-h-0 p-[1cqmin]">
            <img
              class="block object-contain object-left-top w-full h-full"
              draggable="false"
              use:imgSrcEx={assetPack.getIconUrl(
                forecast.current.weatherCode,
                forecast.current.timeOfDay,
                $debouncedTextColor,
              )}
              alt={m.Widgets_Weather_Forecast_Current_WeatherIcon_Alt()} />
          </div>
        {/if}
      </div>
      <div class="row-start-1 col-start-2 row-end-2 col-end-3">
        <div class="text-right {$showDetails ? 'text-[1.3em]' : 'text-[calc(85cqh-max(1em,7px))]'} leading-none">
          {adaptTemperature(forecast.current.temperature2m, $measurementUnits)}&deg;
        </div>
        <div class={$showDetails ? 'text-[max(0.4em,7px)]' : 'text-[max(1em,7px)]'}>
          {m.Widgets_Weather_Forecast_Current_FeelsLike()}
          {adaptTemperature(forecast.current.apparentTemperature, $measurementUnits)}&deg;
        </div>
      </div>
      {#if $showDetails}
        <div class="row-start-2 col-start-1 row-end-3 col-end-3 text-[max(.3em,6px)]">
          <TabGroup
            padding="px-2 py-0"
            regionPanel="!mt-[3cqmin]"
            border="border-b border-[var(--st--text-color)]"
            active="border-b-2 border-[var(--st--text-color)]"
            hover="hover:bg-[color-mix(in_srgb,currentColor_20%,transparent)]">
            <Tab bind:group={currentTab} name="Widget_{id}_tab_hourly" value={0}>
              <span>{m.Widgets_Weather_Forecast_Hourly()}</span>
            </Tab>
            <Tab bind:group={currentTab} name="Widget_{id}_tab_daily" value={1}>
              <span>{m.Widgets_Weather_Forecast_Daily()}</span>
            </Tab>
            <TabAnchor href={weatherDetailsLink} rel="noreferrer" referrerpolicy="no-referrer">
              {m.Widgets_Weather_Forecast_Details()}
              <span class="icon-[heroicons-solid--external-link]"></span>
            </TabAnchor>
            <svelte:fragment slot="panel">
              {#if currentTab === 0}
                <div class="flex flex-row gap-1 overflow-x-hidden hover:overflow-x-auto pb-[4cqmin]">
                  {#each hourlyRange as item}
                    <div
                      title={m.Widgets_Weather_Forecast_Hourly_PrecipitationProbability({
                        percent: forecast.hourly.precipitationProbability[item[1]].toFixed(0),
                      })}
                      class="flex flex-col min-w-fit flex-grow">
                      <time class="block text-center whitespace-nowrap mx-1 leading-tight">
                        {intlTimeFormat.format(item[0])}
                      </time>
                      <div class="h-[15cqh] p-[1cqmin]">
                        <img
                          class="object-contain w-full h-full"
                          draggable="false"
                          use:imgSrcEx={assetPack.getIconUrl(
                            forecast.hourly.weatherCode[item[1]],
                            forecast.hourly.timeOfDay[item[1]],
                            $debouncedTextColor,
                          )}
                          alt={m.Widgets_Weather_Forecast_Hourly_WeatherIcon_Alt()} />
                      </div>
                      <div class="text-center mt-auto leading-tight">
                        {adaptTemperature(forecast.hourly.temperature2m[item[1]], $measurementUnits)}&deg;
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if currentTab === 1}
                <div class="flex flex-row gap-1 overflow-x-auto pb-[4cqmin]">
                  {#each dailyRange as item}
                    <div
                      title={m.Widgets_Weather_Forecast_Daily_PrecipitationProbability({
                        percent: forecast.daily.precipitationProbabilityMax[item[1]].toFixed(0),
                      })}
                      class="flex flex-col min-w-fit flex-grow">
                      <time class="block text-center mx-1 leading-tight">
                        {intlDateFormat.format(item[0])}
                      </time>
                      <div class="h-[15cqh] p-[1cqmin]">
                        <img
                          class="object-contain w-full h-full"
                          draggable="false"
                          use:imgSrcEx={assetPack.getIconUrl(
                            forecast.daily.weatherCode[item[1]],
                            forecast.current.timeOfDay,
                            $debouncedTextColor,
                          )}
                          alt={m.Widgets_Weather_Forecast_Daily_WeatherIcon_Alt()} />
                      </div>
                      <div class="text-center mt-auto leading-tight">
                        {adaptTemperature(forecast.daily.temperature2mMin[item[1]], $measurementUnits)}&deg; / {adaptTemperature(
                          forecast.daily.temperature2mMax[item[1]],
                          $measurementUnits,
                        )}&deg;
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </svelte:fragment>
          </TabGroup>
        </div>
      {/if}
    </div>
  {/if}
</div>
