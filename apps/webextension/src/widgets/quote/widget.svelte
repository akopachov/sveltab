<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds, differenceInSeconds } from 'date-fns';
  import { logger } from '$lib/logger';
  import { PUBLIC_THEQUOTEAPI_KEY } from '$env/static/public';
  import { textStroke } from '$actions/text-stroke';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Quote'] });

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestQuote = { quote: string; author: string; lastUpdate: number };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_Quote_${id}_LatestQuote`;

  const {
    updateInterval,
    backgroundColor,
    backgroundBlur,
    textColor,
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let quote: LatestQuote;

  $: {
    ($updateInterval || $clockStore) && checkIfObsoleteDebounced();
  }

  onMount(async () => {
    quote = <LatestQuote>(await storage.local.get(storageKey))[storageKey] || { lastUpdate: 0 };
    checkIfObsoleteDebounced();
  });

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (quote && differenceInSeconds(Date.now(), quote.lastUpdate) > $updateInterval && navigator.onLine) {
      await loadNewQuote();
    }
  }

  async function loadNewQuote() {
    let q: LatestQuote | undefined;
    try {
      const response = await fetch('https://api.quotable.io/quotes/random').then(r => r.json());
      q = { quote: response[0].content, author: response[0].author, lastUpdate: Date.now() };
    } catch (e) {
      log.warn('An error occurred during fetching quote from https://api.quotable.io/quotes/random', e);
    }

    if (!q) {
      const response = await fetch('https://thequoteapi.com/api/quotes/random/', {
        headers: { api_key: PUBLIC_THEQUOTEAPI_KEY },
      }).then(r => r.json());
      q = { quote: response.text, author: response.author, lastUpdate: Date.now() };
    }
    await storage.local.set({ [storageKey]: q });
    quote = q;
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] [-webkit-text-stroke:var(--sv-text-stroke)]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:font-size="{$fontSize}cqmin"
  use:fontsource={{
    font: $fontId,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  use:textStroke={textStrokeSettings}>
  {#if quote}
    <figure>
      <blockquote>"{quote.quote}"</blockquote>
      <figcaption class="text-right mt-2">&mdash;&nbsp;{quote.author}</figcaption>
    </figure>
  {/if}
</div>
