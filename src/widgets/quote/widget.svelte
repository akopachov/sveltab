<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { getStorage } from '$stores/storage';
  import { writable } from 'svelte/store';

  let clockStore = getClockStore(60000);
  let storagePromise = getStorage();
  type LatestQuote = { quote: string; author: string; lastUpdate: number };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_Quote_${id}_LatestQuote`;

  let quote = writable<LatestQuote>();

  $: fontSettings = settings.font;
  $: textShadowSettings = settings.textShadow;
  $: {
    $clockStore && checkIfObsolete();
  }

  onMount(async () => {
    const storage = await storagePromise;
    $quote = <LatestQuote>(await storage.local.get(storageKey))[storageKey] || { lastUpdate: 0 };
    await checkIfObsolete();
  });

  export async function onDelete() {
    const storage = await storagePromise;
    await storage.local.remove(storageKey);
  }

  async function checkIfObsolete() {
    if ($quote && (new Date().valueOf() - $quote.lastUpdate) / 1000 > $settings.updateInterval) {
      await loadNewQuote();
    }
  }

  async function loadNewQuote() {
    const response = await fetch('https://api.quotable.io/random').then(r => r.json());
    const q: LatestQuote = { quote: response.content, author: response.author, lastUpdate: new Date().valueOf() };
    const storage = await storagePromise;
    await storage.local.set({ [storageKey]: q });
    $quote = q;
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col"
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  style:filter="drop-shadow({$textShadowSettings.offsetX}cqmin {$textShadowSettings.offsetY}cqmin {$textShadowSettings.blur}cqmin
  {$textShadowSettings.color})"
  style:font-size="{$fontSettings.size}cqmin"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}>
  {#if $quote?.lastUpdate > 0}
    <blockquote>"{$quote.quote}"</blockquote>
    <p class="text-right mt-2">{$quote.author}</p>
  {/if}
</div>
