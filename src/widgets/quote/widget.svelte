<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds } from 'date-fns';
  import { millisecondsToSeconds } from 'date-fns';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestQuote = { quote: string; author: string; lastUpdate: number };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_Quote_${id}_LatestQuote`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let quote: LatestQuote;

  $: fontSettings = settings.font;
  $: textShadowSettings = settings.textShadow;
  $: {
    $clockStore && checkIfObsoleteDebounced();
  }

  onMount(async () => {
    quote = <LatestQuote>(await storage.local.get(storageKey))[storageKey] || { lastUpdate: 0 };
    checkIfObsoleteDebounced();
  });

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (quote && millisecondsToSeconds(Date.now() - quote.lastUpdate) > $settings.updateInterval) {
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
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  style:text-shadow="{$textShadowSettings.offsetX}cqmin {$textShadowSettings.offsetY}cqmin {$textShadowSettings.blur}cqmin
  {$textShadowSettings.color}"
  style:font-size="{$fontSettings.size}cqmin"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontSettings.weight],
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
