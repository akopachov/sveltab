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
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { locale, localeCharSubset } from '$stores/locale';
  import { differenceInDays, getHours, getDay, getMonth, hoursToMilliseconds, differenceInMinutes } from 'date-fns';
  import { textStroke } from '$actions/text-stroke';
  import { Opfs } from '$lib/opfs';
  import { logger } from '$lib/logger';

  export let settings: Settings;

  const log = logger.getSubLogger({ prefix: ['Widget', 'Greeting'] });
  const clockStore = getPreciselyAlignedClockStore(hoursToMilliseconds(1));
  const opfsCacheDir = 'widgets/greeting';

  $: updateGreetingsPool($clockStore);
  $: updateGreeting(greetingsPool, $name);

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
  let greetingsPool: string[] | null = null;
  let greetingsPoolLastUpdateTime: number;

  async function updateGreetingsPool(time: Date) {
    if (greetingsPool == null || differenceInMinutes(greetingsPoolLastUpdateTime, time) >= 60) {
      const hours = getHours(time);
      const month = monthNames[getMonth(time)];
      const day = dayNames[getDay(time)];
      const language = localeToLanguagesMap.get($locale);
      const relativeFilePath = `${language}/${month}/${day}/${String(hours).padStart(2, '0')}-00.json`;
      let lastUpdatedTime: number = 0;
      let greetings: string[] = [];
      try {
        const cachedFile = await Opfs.get(`${opfsCacheDir}/greetings/${relativeFilePath}`);
        lastUpdatedTime = cachedFile.lastModified;
        greetings = JSON.parse(await cachedFile.text());
      } catch {}

      if (greetings.length <= 0 || differenceInDays(time, lastUpdatedTime) > 3) {
        try {
          const response = await fetch(
            `https://cdn.statically.io/gh/akopachov/greetings@master/greetings/${relativeFilePath}`,
          );
          const blob = await response.blob();
          greetings = JSON.parse(await blob.text());
          try {
            await Opfs.save(`${opfsCacheDir}/greetings/${relativeFilePath}`, blob);
          } catch {}
        } catch (error) {
          log.error('Failed to fetch greetings', error);
        }
      }

      greetingsPoolLastUpdateTime = Date.now();
      greetingsPool = greetings;
    }
  }

  function updateGreeting(greetings: string[] | null, name: string) {
    if (greetings && greetings.length > 0) {
      let greetingsToUse = greetings;
      if (!name) {
        greetingsToUse = greetingsToUse.filter(greeting => !greeting.includes('{name}'));
      }
      let greeting = greetingsToUse[Math.floor(Math.random() * greetingsToUse.length)];
      if (name) {
        greeting = greeting.replace('{name}', name);
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
