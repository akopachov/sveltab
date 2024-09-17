<script lang="ts">
  import type { Settings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { differenceInDays, getHours, getMinutes, minutesToMilliseconds } from 'date-fns';
  import { textStroke } from '$actions/text-stroke';
  import { Opfs } from '$lib/opfs';
  import { logger } from '$lib/logger';
  import { online } from '$stores/online-store';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Literature Clock'] });
  let clockStore = getPreciselyAlignedClockStore(minutesToMilliseconds(1));
  export let settings: Settings;

  $: updateTimeQuote($clockStore);

  const opfsCacheDir = `widgets/literature-clock`;

  type TimeQuote = {
    time: string;
    quote_first: string;
    quote_time_case: string;
    quote_last: string;
    title: string;
    author: string;
  };

  const {
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textShadow: {
      blur: textShadowBlur,
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      color: textShadowColor,
    },
    backgroundBlur,
    textColor,
    backgroundColor,
    timeTextColor,
    textStroke: textStrokeSettings,
    timeTextStroke: timeTextStrokeSettings,
    timeFont: { id: timeFontId, weight: timeFontWeight, size: timeFontSize },
    timeTextShadow: {
      blur: timeTextShadowBlur,
      offsetX: timeTextShadowOffsetX,
      offsetY: timeTextShadowOffsetY,
      color: timeTextShadowColor,
    },
  } = settings;

  let currentQuote: TimeQuote | null = null;

  async function updateTimeQuote(time: Date) {
    const hours = getHours(time);
    const minutes = getMinutes(time);
    const fileName = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}.json`;
    let quotes: TimeQuote[] = [];
    let lastUpdatedTime: number = 0;
    try {
      const cachedFile = await Opfs.get(`${opfsCacheDir}/times/${fileName}`);
      lastUpdatedTime = cachedFile.lastModified;
      quotes = JSON.parse(await cachedFile.text());
    } catch {}

    if ((quotes.length <= 0 || differenceInDays(time, lastUpdatedTime) > 30) && $online) {
      try {
        const response = await fetch(
          `https://cdn.statically.io/gh/lbngoc/literature-clock@master/docs/times/${fileName}`,
        );
        const blob = await response.blob();
        quotes = JSON.parse(await blob.text());
        try {
          await Opfs.save(`${opfsCacheDir}/times/${fileName}`, blob);
        } catch {}
      } catch (error) {
        log.error('Failed to fetch time quote', error);
      }
    }

    if (quotes.length > 0) {
      currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } else {
      currentQuote = null;
    }
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center overflow-hidden hover:overflow-y-auto backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:--st-blur="{$backgroundBlur}px">
  {#if currentQuote}
    <figure>
      <!-- prettier-ignore -->
      <blockquote class="leading-tight">
        <span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={$textColor}
          style:font-weight={$fontWeight}
          style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
          {$textShadowColor}"
          style:font-size="{$fontSize}cqmin"
          use:fontsource={{
            font: $fontId,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [$fontWeight],
          }}
          use:textStroke={textStrokeSettings}>{@html currentQuote.quote_first}</span><span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={$timeTextColor}
          style:font-weight={$timeFontWeight}
          style:--st-shadow="{$timeTextShadowOffsetX}cqmin {$timeTextShadowOffsetY}cqmin {$timeTextShadowBlur}cqmin
          {$timeTextShadowColor}"
          style:font-size="{$timeFontSize}cqmin"
          use:fontsource={{
            font: $timeFontId,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [$timeFontWeight],
          }}
          use:textStroke={timeTextStrokeSettings}>{@html currentQuote.quote_time_case}</span><span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={$textColor}
          style:font-weight={$fontWeight}
          style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
          {$textShadowColor}"
          style:font-size="{$fontSize}cqmin"
          use:fontsource={{
            font: $fontId,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [$fontWeight],
          }}
          use:textStroke={textStrokeSettings}>{@html currentQuote.quote_last}</span>
      </blockquote>
      <!-- prettier-ignore -->
      <figcaption
        class="text-right mt-2 drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
        style:color={$textColor}
        style:font-weight={$fontWeight}
        style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
        {$textShadowColor}"
        style:font-size="{$fontSize}cqmin"
        use:fontsource={{
          font: $fontId,
          styles: ['normal'],
          subsets: ['latin'],
          weights: [$fontWeight],
        }}
        use:textStroke={textStrokeSettings}>
        &mdash;&nbsp;<cite class="not-italic">{currentQuote.title}</cite>, {currentQuote.author}
      </figcaption>
    </figure>
  {/if}
</div>
