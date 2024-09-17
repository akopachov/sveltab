<script lang="ts" context="module">
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const localeToLanguagesMap = new Map([
    ['en', 'English'],
    ['pl', 'Polish'],
    ['be', 'Belarusian'],
  ]);
  const namePlaceholder = '{name}';
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { locale, localeCharSubset } from '$stores/locale';
  import { getHours, getDay, getMonth, hoursToMilliseconds, differenceInHours } from 'date-fns';
  import { textStroke } from '$actions/text-stroke';
  import { logger } from '$lib/logger';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';

  type CachedGreetings = { pool: string[]; lastUpdateDate: number; hour: number; locale: typeof $locale };

  export let settings: Settings;
  export let id: string;

  const log = logger.getSubLogger({ prefix: ['Widget', 'Greeting'] });
  const clockStore = getPreciselyAlignedClockStore(hoursToMilliseconds(1));
  const storageKey = `Widget_Greeting_${id}_CachedPool`;

  $: updateGreetingsPool($clockStore, $locale);
  $: cache && updateGreeting(cache.pool, $name);

  const {
    name,
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textColor,
    backgroundColor,
    backgroundBlur,
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  let currentGreeting: string | null = null;
  let cache: CachedGreetings | null = null;

  onMount(async () => {
    cache = <CachedGreetings>(await storage.local.get(storageKey))[storageKey] || {
      pool: [],
      lastUpdateDate: 0,
      hour: 0,
      locale: '',
    };
    await updateGreetingsPool($clockStore, $locale);
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  async function updateGreetingsPool(time: Date, locale: typeof $locale) {
    const hours = getHours(time);
    if (
      cache &&
      (cache.hour !== hours || cache.locale !== locale || differenceInHours(cache.lastUpdateDate, time) >= 24)
    ) {
      try {
        const month = monthNames[getMonth(time)];
        const day = dayNames[getDay(time)];
        const language = localeToLanguagesMap.get(locale) || 'English';
        const relativeFilePath = `${language}/${month}/${day}/${String(hours).padStart(2, '0')}-00.json`;
        const greetings = await fetch(
          `https://cdn.statically.io/gh/akopachov/greetings@master/greetings/${relativeFilePath}`,
        ).then(response => response.json());
        cache = { lastUpdateDate: Date.now(), hour: hours, pool: greetings, locale: locale };
        await storage.local.set({ [storageKey]: cache });
      } catch (error) {
        log.error('Failed to fetch greetings', error);
      }
    }
  }

  function updateGreeting(greetings: string[] | null, name: string) {
    if (greetings && greetings.length > 0) {
      let greetingsToUse = greetings;
      if (!name) {
        greetingsToUse = greetingsToUse.filter(greeting => !greeting.includes(namePlaceholder));
      }
      let greeting = greetingsToUse[Math.floor(Math.random() * greetingsToUse.length)];
      if (name) {
        greeting = greeting.replace(namePlaceholder, name);
      }
      currentGreeting = greeting;
    } else {
      currentGreeting = null;
    }
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center flex-col backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:font-size="{$fontSize}cqmin"
  use:fontsource={{
    font: $fontId,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  use:textStroke={textStrokeSettings}>
  <p class="text-[calc(85cqh-1rem)] text-center leading-tight [-webkit-text-stroke:var(--sv-text-stroke)]">
    {currentGreeting || ''}
  </p>
</div>
