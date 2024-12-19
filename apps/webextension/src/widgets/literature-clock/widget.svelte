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

  let { settings }: { settings: Settings } = $props();

  $effect(() => {
    updateTimeQuote($clockStore);
  });

  const opfsCacheDir = `widgets/literature-clock`;

  type TimeQuote = {
    time: string;
    quote_first: string;
    quote_time_case: string;
    quote_last: string;
    title: string;
    author: string;
  };

  let currentQuote: TimeQuote | undefined | null = $state();

  async function updateTimeQuote(time: Date) {
    const hours = getHours(time);
    const minutes = getMinutes(time);
    const fileName = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}.json`;
    let quotes: TimeQuote[] = [];
    let lastUpdatedTime: number = 0;
    const opfsIsAvailable = await Opfs.isAvailable();
    if (opfsIsAvailable) {
      try {
        const cachedFile = await Opfs.get(`${opfsCacheDir}/times/${fileName}`);
        lastUpdatedTime = cachedFile.lastModified;
        quotes = JSON.parse(await cachedFile.text());
      } catch {}
    }

    if ((quotes.length <= 0 || differenceInDays(time, lastUpdatedTime) > 30) && $online) {
      try {
        const response = await fetch(
          `https://cdn.statically.io/gh/lbngoc/literature-clock@master/docs/times/${fileName}`,
        );
        const blob = await response.blob();
        quotes = JSON.parse(await blob.text());
        if (opfsIsAvailable) {
          try {
            await Opfs.save(`${opfsCacheDir}/times/${fileName}`, blob);
          } catch {}
        }
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
  style:background-color={settings.backgroundColor.value}
  style:--st-blur="{settings.backgroundBlur.value}px">
  {#if currentQuote}
    <figure>
      <!-- prettier-ignore -->
      <blockquote class="leading-tight">
        <span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={settings.textColor.value}
          style:font-weight={settings.font.weight.value}
          style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings.textShadow.blur.value}cqmin
          {settings.textShadow.color.value}"
          style:font-size="{settings.font.size.value}cqmin"
          use:fontsource={{
            font: settings.font.id.value,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [settings.font.weight.value],
          }}
          use:textStroke={settings.textStroke}>{@html currentQuote.quote_first}</span><span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={settings.timeTextColor.value}
          style:font-weight={settings.timeFont.weight.value}
          style:--st-shadow="{settings.timeTextShadow.offsetX.value}cqmin {settings.timeTextShadow.offsetY.value}cqmin {settings.timeTextShadow.blur.value}cqmin
          {settings.timeTextShadow.color.value}"
          style:font-size="{settings.timeFont.size.value}cqmin"
          use:fontsource={{
            font: settings.timeFont.id.value,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [settings.timeFont.weight.value],
          }}
          use:textStroke={settings.timeTextStroke}>{@html currentQuote.quote_time_case}</span><span
          class="drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:color={settings.textColor.value}
          style:font-weight={settings.font.weight.value}
          style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings.textShadow.blur.value}cqmin
          {settings.textShadow.color.value}"
          style:font-size="{settings.font.size.value}cqmin"
          use:fontsource={{
            font: settings.font.id.value,
            styles: ['normal'],
            subsets: ['latin'],
            weights: [settings.font.weight.value],
          }}
          use:textStroke={settings.textStroke}>{@html currentQuote.quote_last}</span>
      </blockquote>
      <!-- prettier-ignore -->
      <figcaption
        class="text-right mt-2 drop-shadow-[var(--st-shadow)] [-webkit-text-stroke:var(--sv-text-stroke)]"
        style:color={settings.textColor.value}
        style:font-weight={settings.font.weight.value}
        style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings.textShadow.blur.value}cqmin
        {settings.textShadow.color.value}"
        style:font-size="{settings.font.size.value}cqmin"
        use:fontsource={{
          font: settings.font.id.value,
          styles: ['normal'],
          subsets: ['latin'],
          weights: [settings.font.weight.value],
        }}
        use:textStroke={settings.textStroke}>
        &mdash;&nbsp;<cite class="not-italic">{currentQuote.title}</cite>, {currentQuote.author}
      </figcaption>
    </figure>
  {/if}
</div>
