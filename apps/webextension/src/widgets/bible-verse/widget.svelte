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
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { getAvailableBooks, getChapter } from './api';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Bible Verse'] });

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestVerse = {
    text: string;
    book: string;
    chapter: number;
    verse: number;
    translation: string;
    lastUpdate: number;
  };

  let { id, settings }: { id: string; settings: Settings } = $props();

  const storageKey = `Widget_BibleVerse_${id}_LatestVerse`;

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  let verse: LatestVerse | undefined = $state();

  $effect(() => {
    void (settings.updateInterval.value, $clockStore, settings.translation.value);
    checkIfObsoleteDebounced();
  });

  onMount(async () => {
    verse = <LatestVerse>(await storage.local.get(storageKey))[storageKey] || { lastUpdate: 0 };
    checkIfObsoleteDebounced();
  });

  const checkIfObsoleteDebounced = pDebounce.promise(checkIfObsolete);

  async function checkIfObsolete() {
    if (
      verse &&
      (differenceInSeconds(Date.now(), verse.lastUpdate) > settings.updateInterval.value ||
        verse.translation !== settings.translation.value) &&
      navigator.onLine
    ) {
      await loadNewVerse();
    }
  }

  async function loadNewVerse() {
    try {
      const books = await getAvailableBooks(settings.translation.value);
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const randomChapter = Math.ceil(Math.random() * randomBook.numberOfChapters);
      const chapter = await getChapter(settings.translation.value, randomBook.id, randomChapter);
      const chapterVerses = chapter.content.filter(f => f.type === 'verse');
      const randomVerse = chapterVerses[Math.floor(Math.random() * chapterVerses.length)];
      const firstContent = randomVerse.content.find(f => typeof f === 'string' || 'text' in f);
      const verseText = typeof firstContent === 'string' ? firstContent : firstContent?.text || '';
      verse = {
        text: verseText,
        book: randomBook.name,
        chapter: randomChapter,
        verse: randomVerse.number,
        translation: settings.translation.value,
        lastUpdate: Date.now(),
      };
    } catch (e) {
      log.warn('An error occurred during fetching The Bible verse', e);
    }

    await storage.local.set({ [storageKey]: $state.snapshot(verse) });
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] [-webkit-text-stroke:var(--sv-text-stroke)]"
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
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
  {#if verse && verse.text}
    <figure>
      <blockquote class="verse" title="{verse.book} {verse.chapter}:{verse.verse}">"{verse.text}"</blockquote>
      {#if settings.displayReference.value}
        <figcaption class="ref text-right mt-2">
          &mdash;&nbsp;{verse.book}&nbsp;{verse.chapter}:{verse.verse}
        </figcaption>
      {/if}
    </figure>
  {/if}
</div>
