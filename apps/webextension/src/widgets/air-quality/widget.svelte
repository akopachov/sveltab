<script lang="ts">
  import { AirQualityLegislation, AirQualityVariables, type Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import { fetchWeatherApi } from 'openmeteo';
  import { localeCharSubset } from '$stores/locale';
  import pDebounce from 'p-debounce';
  import { differenceInMinutes, minutesToMilliseconds } from 'date-fns';
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
  import { getAirQualityIndexDescription, getAirQualityIndexMaxValue } from './aqi-utils';
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import { getRedirectUrl } from './iqair-redirect.gen';
  import { textStroke } from '$actions/text-stroke';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Air Quality'] });

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestInfo = {
    lastUpdate: number;
    latitude: number;
    longitude: number;
    legislation: AirQualityLegislation;
    current: {
      airQualityIndex: number;
      pm10: number;
      pm2_5: number;
      carbon_monoxide: number;
      nitrogen_dioxide: number;
      sulphur_dioxide: number;
      ozone: number;
      aerosol_optical_depth: number;
      dust: number;
    };
  };

  let {
    settings,
    id,
    onautosettingsupdate,
  }: { settings: Settings; id: string; onautosettingsupdate: (arg: { id: string; settings: Settings }) => void } =
    $props();

  const {
    location: { latitude, longitude, city, country, admin1, admin2 },
    textColor,
    backgroundBlur,
    backgroundColor,
    legislation,
    queryUserLocation,
    font: { id: fontId, weight: fontWeight },
    showVariables,
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  const storageKey = `Widget_AirQuality_${id}_Latest`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let latestInfo: LatestInfo | undefined = $state();

  $effect(() => {
    ($clockStore || $latitude || $longitude || $legislation) && checkIfObsoleteDebounced();
  });

  $effect(() => {
    $queryUserLocation && queryUserGeolocation();
  });

  let airQualityDescriptor = $derived.by(() =>
    latestInfo ? getAirQualityIndexDescription(latestInfo.current.airQualityIndex, latestInfo.legislation) : null,
  );

  let currentAirQualityIndexText = $derived(airQualityDescriptor?.text() || '');
  let currentAirQualityIndexPercent = $derived.by(() =>
    latestInfo ? (latestInfo.current.airQualityIndex / getAirQualityIndexMaxValue(latestInfo?.legislation)) * 100 : 0,
  );

  let airQualityDetailsLink = $derived(getRedirectUrl($city, $latitude, $longitude));

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
    if (!latestInfo) {
      latestInfo = <LatestInfo>(await storage.local.get(storageKey))[storageKey];
    }

    if (
      !latestInfo ||
      differenceInMinutes(Date.now(), latestInfo.lastUpdate) > 15 || // Every 15 minutes
      latestInfo.latitude !== $latitude || // Or location change
      latestInfo.longitude !== $longitude ||
      latestInfo.legislation !== $legislation
    ) {
      await loadNewInfo();
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
        onautosettingsupdate({ id, settings });
      }
    } catch (e) {
      log.warn("An error ocurred during querying user's geolocation", e);
    }
  }

  async function loadNewInfo() {
    if (!$city || !navigator.onLine) return;
    const params = {
      latitude: $latitude,
      longitude: $longitude,
      current: [
        $legislation,
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'aerosol_optical_depth',
        'dust',
      ],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const response = await fetchWeatherApi('https://air-quality-api.open-meteo.com/v1/air-quality', params);
    const current = response[0].current()!;
    latestInfo = {
      lastUpdate: Date.now(),
      latitude: $latitude,
      longitude: $longitude,
      legislation: $legislation,
      current: {
        airQualityIndex: current.variables(0)!.value(),
        pm10: current.variables(1)!.value(),
        pm2_5: current.variables(2)!.value(),
        carbon_monoxide: current.variables(3)!.value(),
        nitrogen_dioxide: current.variables(4)!.value(),
        sulphur_dioxide: current.variables(5)!.value(),
        ozone: current.variables(6)!.value(),
        aerosol_optical_depth: current.variables(7)!.value(),
        dust: current.variables(8)!.value(),
      },
    } satisfies LatestInfo;
    await storage.local.set({ [storageKey]: latestInfo });
  }
</script>

<div
  class="w-full h-full select-none flex justify-center content-center flex-col p-[5cqmin] text-[var(--st--text-color)] text-[15cqmin] [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] rounded-[inherit] [&_*]:[-webkit-text-stroke:var(--sv-text-stroke)]"
  style:background-color={$backgroundColor}
  style:--st--text-color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  use:loadingPlaceholder={!!latestInfo && latestInfo.lastUpdate > 0}
  use:fontsource={{
    font: $fontId,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  use:textStroke={textStrokeSettings}>
  {#if latestInfo && latestInfo.lastUpdate > 0}
    <div class="flex flex-row max-h-[calc(100cqh-10cqmin)] h-full">
      <div class="flex flex-col flex-auto">
        <p class="mb-[.5em]">
          <a class="hover:underline" href={airQualityDetailsLink} rel="noreferrer" referrerpolicy="no-referrer">
            {currentAirQualityIndexText}
          </a>
        </p>
        <div class="overflow-y-auto">
          <table class="text-[max(0.5em,7px)] w-full max-w-[10em] leading-normal">
            <tbody>
              {#if $showVariables.includes(AirQualityVariables.PM2_5)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">
                    PM
                    <sub>2.5</sub>
                  </td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.pm2_5.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
              {#if $showVariables.includes(AirQualityVariables.PM10)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">
                    PM
                    <sub>10</sub>
                  </td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.pm10.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
              {#if $showVariables.includes(AirQualityVariables.CarbonMonoxide)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">CO</td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.carbon_monoxide.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
              {#if $showVariables.includes(AirQualityVariables.NitrogenDioxide)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">
                    NO
                    <sub>2</sub>
                  </td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.nitrogen_dioxide.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
              {#if $showVariables.includes(AirQualityVariables.SulfurDioxide)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">
                    SO
                    <sub>2</sub>
                  </td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.sulphur_dioxide.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
              {#if $showVariables.includes(AirQualityVariables.Ozone)}
                <tr>
                  <td class="w-full whitespace-nowrap pr-2">
                    O
                    <sub>3</sub>
                  </td>
                  <td class="whitespace-nowrap pr-1 text-right">{latestInfo.current.ozone.toFixed(0)}</td>
                  <td class="whitespace-nowrap">
                    μg/m
                    <sup>3</sup>
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
      <div class="relative h-full aspect-square">
        <div class="rotate-180">
          <ProgressRadial
            width="w-full"
            value={currentAirQualityIndexPercent}
            stroke={100}
            meter={airQualityDescriptor?.meterColor || ''}
            track={airQualityDescriptor?.trackColor || ''}
            strokeLinecap="butt" />
        </div>
        <a
          class="hover:underline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[1.5em]"
          href={airQualityDetailsLink}
          rel="noreferrer"
          referrerpolicy="no-referrer">
          {latestInfo.current.airQualityIndex.toFixed(0)}
        </a>
      </div>
    </div>
  {/if}
</div>
