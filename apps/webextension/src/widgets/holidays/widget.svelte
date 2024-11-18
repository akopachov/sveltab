<script lang="ts" module>
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

  let { id, settings }: { id: string; settings: Settings } = $props();

  const storageKey = `Widget_Holidays_${id}_CachedHolidays`;

  let shortDateFormat = $derived(
    new Intl.DateTimeFormat($locale, {
      month: 'short',
      day: 'numeric',
    }),
  );

  let longDateFormat = $derived(
    new Intl.DateTimeFormat($locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      weekday: 'long',
    }),
  );

  let cache: CachedHolidays | undefined | null = $state();

  let typesOfInterestSet = $derived(new Set(settings.typesOfInterest.value));
  let holidaysOfInterest = $derived(
    cache ? cache.holidays.filter(f => f.types.some(t => typesOfInterestSet.has(t))) : [],
  );
  let closestHolidayIndex = $derived(cache ? getClosestUpcommingHolidayIndex(holidaysOfInterest, $now) : -1);
  let visibleHolidays = $derived(
    cache
      ? holidaysOfInterest.slice(
          Math.max(0, closestHolidayIndex - settings.pastCount.value),
          Math.min(closestHolidayIndex + settings.upcommingCount.value, holidaysOfInterest.length - 1),
        )
      : [],
  );

  $effect(() => {
    void (settings.country.value, visibleHolidays, $online);
    updateIfNeeded();
  });

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
        cache.country !== settings.country.value ||
        closestHolidayIndex + settings.upcommingCount.value >= holidaysOfInterest.length ||
        closestHolidayIndex - settings.pastCount.value < 0)
    ) {
      await loadNewHolidays();
    }
  }, 500);

  async function loadNewHolidays() {
    if (!navigator.onLine || !cache) {
      return;
    }

    const now = new Date();
    let holidays = await getHolidayInfo(settings.country.value, now.getFullYear());
    const closestCurrentIndex = getClosestUpcommingHolidayIndex(holidays, now);
    if (closestCurrentIndex - settings.pastCount.value < 0) {
      const previousHolidays = await getHolidayInfo(settings.country.value, now.getFullYear() - 1);
      holidays = [...previousHolidays, ...holidays];
    }
    if (closestCurrentIndex + settings.upcommingCount.value >= holidays.length) {
      const nextHolidays = await getHolidayInfo(settings.country.value, now.getFullYear() + 1);
      holidays.push(...nextHolidays);
    }

    cache.holidays = holidays.map(holiday => ({ ...holiday, date: new Date(holiday.date).getTime() }));
    cache.lastUpdate = Date.now();
    cache.country = settings.country.value;
    await storage.local.set({ [storageKey]: $state.snapshot(cache) });
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
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:text-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  style:--st-font-size="{visibleHolidays.length > 0 ? 48 / visibleHolidays.length : 0}cqh"
  use:fontsource={{
    font: settings.font.id.value,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
  <ul class="list text-[length:var(--st-font-size)] leading-normal [-webkit-text-stroke:var(--sv-text-stroke)]">
    {#each visibleHolidays as holiday}
      <li
        class:today={isToday(holiday.date)}
        style:color={isToday(holiday.date) ? settings.textColorToday.value : ''}
        use:fontsource={isToday(holiday.date)
          ? {
              font: settings.fontToday.id.value,
              subsets: $userPosssibleLocaleCharSubset,
              styles: ['normal'],
              weights: [settings.fontToday.weight.value],
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
