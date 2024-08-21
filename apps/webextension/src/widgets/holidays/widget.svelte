<script lang="ts" context="module">
  const TypeDisplayNameMap = {
    [HolidayType.Public]: m.Widgets_Holidays_Settings_Types_Public,
    [HolidayType.Bank]: m.Widgets_Holidays_Settings_Types_Bank,
    [HolidayType.School]: m.Widgets_Holidays_Settings_Types_School,
    [HolidayType.Optional]: m.Widgets_Holidays_Settings_Types_Optional,
    [HolidayType.Authorities]: m.Widgets_Holidays_Settings_Types_Authorities,
    [HolidayType.Observance]: m.Widgets_Holidays_Settings_Types_Observance,
  };
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { locale, userPosssibleLocaleCharSubset } from '$stores/locale';
  import { type HolidayInfo, HolidayType, getHolidayInfo } from './api';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import { getClockStore } from '$stores/clock-store';
  import { differenceInDays, minutesToMilliseconds, isToday, formatISO, isBefore } from 'date-fns';
  import { online } from '$stores/online-store';
  import * as m from '$i18n/messages';
  import pDebounce from 'p-debounce';
  import { textStroke } from '$actions/text-stroke';

  type CachedHoliday = Omit<HolidayInfo, 'date'> & { date: number };
  type CachedHolidays = { lastUpdate: number; holidays: CachedHoliday[]; country: string; loadedYears: number[] };
  let now = getClockStore(minutesToMilliseconds(10));

  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_Holidays_${id}_CachedHolidays`;

  $: shortDateFormat = new Intl.DateTimeFormat($locale, {
    month: 'short',
    day: 'numeric',
  });
  $: longDateFormat = new Intl.DateTimeFormat($locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  });

  const {
    country,
    pastCount,
    upcommingCount,
    backgroundColor,
    backgroundBlur,
    textColor,
    textColorToday,
    typesOfInterest,
    font: { id: fontId, weight: fontWeight },
    fontToday: { id: todayFontId, weight: todayFontWeight },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  let cache: CachedHolidays;

  $: typesOfInterestSet = new Set($typesOfInterest);
  $: holidaysOfInterest = cache ? cache.holidays.filter(f => f.types.some(t => typesOfInterestSet.has(t))) : [];
  $: closestHolidayIndex = cache ? getClosestUpcommingHolidayIndex(holidaysOfInterest, $now) : -1;
  $: visibleHolidays = cache
    ? holidaysOfInterest.slice(
        Math.max(0, closestHolidayIndex - $pastCount),
        Math.min(closestHolidayIndex + $upcommingCount, holidaysOfInterest.length - 1),
      )
    : [];

  $: {
    ($country || visibleHolidays || $online) && updateIfNeeded();
  }

  onMount(async () => {
    cache = <CachedHolidays>(await storage.local.get(storageKey))[storageKey] || {
      lastUpdate: 0,
      holidays: [],
    };
    updateIfNeeded();
  });

  const updateIfNeeded = pDebounce(async () => {
    if (
      cache &&
      (cache.holidays.length === 0 ||
        !isToday(cache.lastUpdate) ||
        cache.country !== $country ||
        closestHolidayIndex + $upcommingCount >= holidaysOfInterest.length ||
        closestHolidayIndex - $pastCount < 0)
    ) {
      await loadNewHolidays();
    }
  }, 500);

  async function loadNewHolidays() {
    if (!navigator.onLine) {
      return;
    }

    const now = new Date();
    let holidays = await getHolidayInfo($country, now.getFullYear());
    const closestCurrentIndex = getClosestUpcommingHolidayIndex(holidays, now);
    if (closestCurrentIndex - $pastCount < 0) {
      const previousHolidays = await getHolidayInfo($country, now.getFullYear() - 1);
      holidays = [...previousHolidays, ...holidays];
    }
    if (closestCurrentIndex + $upcommingCount >= holidays.length) {
      const nextHolidays = await getHolidayInfo($country, now.getFullYear() + 1);
      holidays.push(...nextHolidays);
    }

    cache.holidays = holidays.map(holiday => ({ ...holiday, date: new Date(holiday.date).getTime() }));
    cache.lastUpdate = Date.now();
    cache.country = $country;
    cache = cache;
    await storage.local.set({ [storageKey]: cache });
  }

  function getClosestUpcommingHolidayIndex(holidays: (HolidayInfo | CachedHoliday)[], now: Date) {
    let minDifference = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < holidays.length; i++) {
      const currentHoliday = holidays[i];
      if (isBefore(currentHoliday.date, now)) {
        continue;
      }
      const difference = Math.abs(differenceInDays(currentHoliday.date, now));
      if (difference > minDifference) {
        return i - 1;
      }

      minDifference = difference;
    }

    return holidays.length - 1;
  }

  function getHolidayHint(holiday: CachedHoliday) {
    const types = holiday.types.map(m => TypeDisplayNameMap[m]()).join(', ');
    if (holiday.counties && holiday.counties.length > 0) {
      const counties = holiday.counties.join(', ');
      return `${types} (${counties})`;
    }

    return types;
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:--st-font-size="{visibleHolidays.length > 0 ? 48 / visibleHolidays.length : 0}cqh"
  use:fontsource={{
    font: $fontId,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  use:textStroke={textStrokeSettings}>
  <ul class="list text-[length:var(--st-font-size)] leading-normal [-webkit-text-stroke:var(--sv-text-stroke)]">
    {#each visibleHolidays as holiday}
      <li
        class:today={isToday(holiday.date)}
        style:color={isToday(holiday.date) ? $textColorToday : ''}
        use:fontsource={isToday(holiday.date)
          ? {
              font: $todayFontId,
              subsets: $userPosssibleLocaleCharSubset,
              styles: ['normal'],
              weights: [$todayFontWeight],
            }
          : null}>
        <time class="flex-auto" title={longDateFormat.format(holiday.date)} datetime={formatISO(holiday.date)}>
          {shortDateFormat.format(holiday.date)}
        </time>
        <span class="flex-auto" title={getHolidayHint(holiday)}>
          {holiday.localName}
        </span>
      </li>
    {/each}
  </ul>
</div>
