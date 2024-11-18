<script lang="ts" module>
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
  import { online } from '$stores/online-store';

  type CachedGreetings = { pool: string[]; lastUpdateDate: number; hour: number; locale: typeof $locale };

  let { id, settings }: { id: string; settings: Settings } = $props();

  const log = logger.getSubLogger({ prefix: ['Widget', 'Greeting'] });
  const clockStore = getPreciselyAlignedClockStore(hoursToMilliseconds(1));
  const storageKey = `Widget_Greeting_${id}_CachedPool`;

  $effect(() => {
    updateGreetingsPool($clockStore, $locale);
  });

  let cache: CachedGreetings | undefined | null = $state.raw();
  let currentGreeting: string | undefined | null = $derived(
    cache ? updateGreeting(cache.pool, settings.name.value) : undefined,
  );

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
      $online &&
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
        await storage.local.set({ [storageKey]: $state.snapshot(cache) });
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
      return greeting;
    }

    return null;
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center flex-col backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:text-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  style:font-size="{settings.font.size.value}cqmin"
  use:fontsource={{
    font: settings.font.id.value,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
  <p class="text-[calc(85cqh-1rem)] text-center leading-tight [-webkit-text-stroke:var(--sv-text-stroke)]">
    {currentGreeting || ''}
  </p>
</div>
