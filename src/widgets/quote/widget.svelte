<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds, millisecondsToSeconds } from 'date-fns';

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
    if (quote && millisecondsToSeconds(Date.now() - quote.lastUpdate) > $updateInterval) {
      await loadNewQuote();
    }
  }

  async function loadNewQuote() {
    const response = await fetch('https://api.quotable.io/quotes/random').then(r => r.json());
    const q: LatestQuote = { quote: response[0].content, author: response[0].author, lastUpdate: Date.now() };
    await storage.local.set({ [storageKey]: q });
    quote = q;
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:backdrop-filter="blur({$backgroundBlur}px)"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:font-size="{$fontSize}cqmin"
  use:fontsource={{
    font: $fontId,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontWeight],
  }}>
  {#if quote?.lastUpdate > 0}
    <figure>
      <blockquote>"{quote.quote}"</blockquote>
      <figcaption class="text-right mt-2">&mdash;&nbsp;{quote.author}</figcaption>
    </figure>
  {:else}
    <div class="absolute left-0 top-0 w-full !h-full placeholder animate-pulse !rounded-[inherit]" />
  {/if}
</div>
