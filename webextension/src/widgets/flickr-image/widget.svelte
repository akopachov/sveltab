<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { PUBLIC_FLICKR_API_KEY } from '$env/static/public';
  import { minutesToMilliseconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
  import { loadingPlaceholder } from '$actions/loading-placeholder';
  import * as m from '$i18n/messages';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type FlickrImageData = { id: string; secret: string; farm: number; server: string; owner: string };
  type CachedData = {
    searchTerm: string;
    page: number;
    totalPages: number;
    images: FlickrImageData[];
    activeImage: FlickrImageData | undefined;
    lastUpdate: number;
  };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_FlickrImage_${id}_CachedData`;

  let latestSearchResult: CachedData | undefined;

  $: activeImage = latestSearchResult?.activeImage;

  const { searchTopic, updateInterval } = settings;

  $: {
    ($searchTopic || $updateInterval || $clockStore) && pickRandomPhotoDebounced();
  }

  onMount(async () => {
    latestSearchResult = <CachedData>(await storage.local.get(storageKey))[storageKey] || {
      images: [],
      searchTerm: '',
      page: 0,
      totalPages: 0,
      activeImage: undefined,
      lastUpdate: 0,
    };
    await pickRandomPhoto();
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  const pickRandomPhotoDebounced = pDebounce(pickRandomPhoto, secondsToMilliseconds(1));

  async function pickRandomPhoto() {
    if (
      latestSearchResult &&
      (!latestSearchResult.activeImage ||
        millisecondsToSeconds(Date.now() - latestSearchResult.lastUpdate) >= $updateInterval ||
        latestSearchResult.searchTerm !== $searchTopic)
    ) {
      latestSearchResult.lastUpdate = Date.now();
      if (latestSearchResult.images.length <= 0 || latestSearchResult.searchTerm !== $searchTopic) {
        let page = 1;
        if (latestSearchResult.searchTerm === $searchTopic) {
          page = latestSearchResult.page + 1;
          if (page > latestSearchResult.totalPages) {
            page = 1;
          }
        }

        latestSearchResult.searchTerm = $searchTopic || 'random';
        const response = await fetch(
          `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${PUBLIC_FLICKR_API_KEY}&text=${latestSearchResult.searchTerm}&safe_search=1&content_type=1&sort=interestingness-desc&per_page=20&format=json&page=${page}`,
        )
          .then(r => r.text())
          .then(t => JSON.parse(t.substring(14, t.length - 1)));
        latestSearchResult.page = response.photos.page;
        latestSearchResult.totalPages = response.photos.pages;
        latestSearchResult.images = response.photos.photo.map((m: any) => ({
          id: m.id,
          farm: m.farm,
          server: m.server,
          secret: m.secret,
          owner: m.owner,
        }));
      }

      const randomIndex = Math.floor(Math.random() * latestSearchResult.images.length);
      latestSearchResult.activeImage = latestSearchResult.images.splice(randomIndex, 1)[0];

      await storage.local.set({ [storageKey]: latestSearchResult });
    }
  }
</script>

<a
  href={activeImage ? `https://www.flickr.com/photos/${activeImage.owner}/${activeImage.id}` : ''}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-0 rounded-[inherit]"
  use:loadingPlaceholder={!!activeImage}>
  {#if activeImage}
    <img
      class="w-full h-full object-cover select-none bg-surface-200"
      draggable="false"
      src="https://farm{activeImage.farm}.static.flickr.com/{activeImage.server}/{activeImage.id}_{activeImage.secret}_z.jpg"
      alt={m.Widgets_FlickrImage_Image_Alt()} />
  {/if}
</a>
