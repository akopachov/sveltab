<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import pDebounce from 'p-debounce';
  import { minutesToMilliseconds, secondsToMilliseconds, differenceInSeconds } from 'date-fns';
  import { loadingPlaceholder } from '$actions/loading-placeholder';
  import * as m from '$i18n/messages';
  import { type FlickrImageData, flickrSrc } from './flickr-src';
  import { getImageSizes, searchImages } from './api';
  import fallbackImage from '$lib/assets/image-fallback.svg';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type CachedData = {
    searchTerm: string;
    page: number;
    totalPages: number;
    images: Omit<FlickrImageData, 'sources'>[];
    activeImage: FlickrImageData | undefined;
    lastUpdate: number;
  };

  let { id, settings }: { id: string; settings: Settings } = $props();

  const storageKey = `Widget_FlickrImage_${id}_CachedData`;

  let latestSearchResult: CachedData | undefined = $state();

  let activeImage = $derived(latestSearchResult?.activeImage);

  $effect(() => {
    void (settings.searchTopic.value, settings.updateInterval.value, $clockStore);
    pickRandomPhotoDebounced();
  });

  onMount(async () => {
    latestSearchResult =
      <CachedData>(await storage.local.get(storageKey))[storageKey] ||
      ({
        images: [],
        searchTerm: '',
        page: 0,
        totalPages: 0,
        activeImage: undefined,
        lastUpdate: 0,
      } satisfies CachedData);
    await pickRandomPhoto();
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  const pickRandomPhotoDebounced = pDebounce(pickRandomPhoto, secondsToMilliseconds(1));

  async function pickRandomPhoto() {
    if (
      latestSearchResult &&
      navigator.onLine &&
      (!latestSearchResult.activeImage ||
        !latestSearchResult.activeImage.sources ||
        differenceInSeconds(Date.now(), latestSearchResult.lastUpdate) >= settings.updateInterval.value ||
        latestSearchResult.searchTerm !== settings.searchTopic.value)
    ) {
      latestSearchResult.lastUpdate = Date.now();
      if (latestSearchResult.images.length <= 0 || latestSearchResult.searchTerm !== settings.searchTopic.value) {
        let page = 1;
        if (latestSearchResult.searchTerm === settings.searchTopic.value) {
          page = latestSearchResult.page + 1;
          if (page > latestSearchResult.totalPages) {
            page = 1;
          }
        }

        latestSearchResult.searchTerm = settings.searchTopic.value || 'random';
        const response = await searchImages(latestSearchResult.searchTerm, page);
        latestSearchResult.page = response.photos.page;
        latestSearchResult.totalPages = response.photos.pages;
        latestSearchResult.images = response.photos.photo.map(x => ({
          id: x.id,
          owner: x.owner,
        }));
      }

      if (latestSearchResult.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * latestSearchResult.images.length);

        const randomImage = latestSearchResult.images.splice(randomIndex, 1)[0];

        const sizesResponse = await getImageSizes(randomImage.id);
        const sources: FlickrImageData['sources'] = sizesResponse.sizes.size.map(x => ({
          width: x.width,
          height: x.height,
          source: x.source,
        }));

        latestSearchResult.activeImage = {
          ...randomImage,
          sources,
        };
      } else {
        latestSearchResult.activeImage = {
          id: '',
          owner: '',
          sources: [
            {
              width: Number.MAX_SAFE_INTEGER,
              height: Number.MAX_SAFE_INTEGER,
              source: fallbackImage,
            },
          ],
        };
      }

      await storage.local.set({ [storageKey]: $state.snapshot(latestSearchResult) });
    }
  }
</script>

<a
  href={activeImage?.id ? `https://www.flickr.com/photos/${activeImage.owner}/${activeImage.id}` : ''}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-0 rounded-[inherit]"
  use:loadingPlaceholder={!!activeImage}>
  <img
    class="w-full h-full object-cover select-none bg-surface-100-800-token"
    draggable="false"
    use:flickrSrc={activeImage}
    alt={m.Widgets_FlickrImage_Image_Alt()} />
</a>
