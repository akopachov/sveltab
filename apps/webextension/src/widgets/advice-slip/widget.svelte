<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds, differenceInSeconds } from 'date-fns';
  import { logger } from '$lib/logger';
  import { textStroke } from '$actions/text-stroke';
  import { getAdviceSlip, type AdviceSlip } from './api';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Advice slip'] });

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestAdvice = AdviceSlip & { lastUpdate: number };

  let { id, settings }: { id: string; settings: Settings } = $props();

  const storageKey = `Widget_AdviceSlip_${id}_LatestAdvice`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let advice: LatestAdvice | undefined = $state();

  $effect(() => {
    void (settings.updateInterval.value, $clockStore);
    checkIfObsoleteDebounced();
  });

  onMount(async () => {
    advice = <LatestAdvice>(await storage.local.get(storageKey))[storageKey] || { lastUpdate: 0 };
    checkIfObsoleteDebounced();
  });

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (
      advice &&
      differenceInSeconds(Date.now(), advice.lastUpdate) > settings.updateInterval.value &&
      navigator.onLine
    ) {
      await loadNewAdvice();
    }
  }

  async function loadNewAdvice() {
    try {
      const response = await getAdviceSlip();
      advice = { ...response, lastUpdate: Date.now() };
    } catch (e) {
      log.warn('An error occurred during fetching advice', e);
    }

    await storage.local.set({ [storageKey]: $state.snapshot(advice) });
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] [-webkit-text-stroke:var(--sv-text-stroke)]"
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
    subsets: ['latin'],
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
  {#if advice && advice.advice}
    <figure>
      <blockquote class="advice text-center leading-tight text-[1.5em]">{advice.advice}</blockquote>
    </figure>
  {/if}
</div>
