<script lang="ts">
  import { type Settings, XKCDComicsStream } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds, hoursToSeconds } from 'date-fns';
  import { loadingPlaceholder } from '$actions/loading-placeholder';
  import * as m from '$i18n/messages';
  import { getLatestComics, getRandomComics, type XKCDComicsResponse } from './api';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type CachedData = {
    stream: XKCDComicsStream;
    activeComics: XKCDComicsResponse | undefined;
    lastUpdate: number;
  };

  let { id, settings }: { id: string; settings: Settings } = $props();

  const storageKey = `Widget_XKCDComics_${id}_CachedData`;

  let latestResult: CachedData | undefined = $state();

  $effect(() => {
    void (settings.stream.value, updateInterval, $clockStore);
    updateComicsDebounced();
  });

  let updateInterval = $derived(
    settings.stream.value === XKCDComicsStream.Latest ? hoursToSeconds(1) : settings.updateInterval.value,
  );

  let commicsLink = $derived(
    latestResult?.activeComics
      ? latestResult?.activeComics?.link || `https://xkcd.com/${latestResult?.activeComics?.num}/`
      : '',
  );

  onMount(async () => {
    latestResult =
      <CachedData>(await storage.local.get(storageKey))[storageKey] ||
      ({
        stream: settings.stream.value,
        activeComics: undefined,
        lastUpdate: 0,
      } satisfies CachedData);
    await updateComics();
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  const updateComicsDebounced = pDebounce(updateComics, secondsToMilliseconds(1));

  async function updateComics() {
    if (
      latestResult &&
      navigator.onLine &&
      (!latestResult.activeComics ||
        differenceInSeconds(Date.now(), latestResult.lastUpdate) >= updateInterval ||
        latestResult.stream !== settings.stream.value)
    ) {
      latestResult.lastUpdate = Date.now();
      latestResult.stream = settings.stream.value;

      latestResult.activeComics =
        settings.stream.value === XKCDComicsStream.Latest ? await getLatestComics() : await getRandomComics();

      await storage.local.set({ [storageKey]: $state.snapshot(latestResult) });
    }
  }
</script>

<a
  href={commicsLink}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-0 rounded-[inherit]"
  style:--sv-bg-color={settings.backgroundColor.value}
  use:loadingPlaceholder={!!latestResult?.activeComics}>
  <img
    class="w-full h-full object-contain select-none bg-[--sv-bg-color]"
    draggable="false"
    src={latestResult?.activeComics?.img ?? ''}
    alt={m.Widgets_XKCDComics_Image_Alt()} />
</a>
