<script lang="ts">
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { onMount } from 'svelte';
  import { storage } from '$stores/storage';
  import { writable } from 'svelte/store';
  import pDebounce from 'p-debounce';
  import { PUBLIC_FLICKR_API_KEY } from '$env/static/public';
  import { minutesToMilliseconds, millisecondsToSeconds } from 'date-fns';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  type LatestSearchResult = { searchTerm: string; page: number; totalPages: number; images: string[] };
  export let settings: Settings;
  export let id: string;

  const storageKey = `Widget_FlickrImage_${id}_LatestSearchResult`;

  let latestSearchResult = writable<LatestSearchResult>();
  let activeImageUrl: string;
  let lastUpdate: number;

  $: {
    ($settings || $clockStore) && pickRandomPhotoDebounced();
  }

  onMount(async () => {
    $latestSearchResult = <LatestSearchResult>(await storage.local.get(storageKey))[storageKey] || {
      images: [],
      searchTerm: '',
      page: 0,
      totalPages: 0,
    };
    await pickRandomPhoto();
  });

  export async function onDelete() {
    await storage.local.remove(storageKey);
  }

  const pickRandomPhotoDebounced = pDebounce.promise(pickRandomPhoto);

  async function pickRandomPhoto() {
    if (
      $latestSearchResult &&
      (!activeImageUrl ||
        millisecondsToSeconds(new Date().valueOf() - lastUpdate) >= $settings.updateInterval ||
        $latestSearchResult.searchTerm !== $settings.searchTopic)
    ) {
      lastUpdate = new Date().valueOf();
      if ($latestSearchResult.images.length <= 0 || $latestSearchResult.searchTerm !== $settings.searchTopic) {
        let page = 1;
        if ($latestSearchResult.searchTerm === $settings.searchTopic) {
          page = $latestSearchResult.page + 1;
          if (page > $latestSearchResult.totalPages) {
            page = 1;
          }
        }

        $latestSearchResult.searchTerm = $settings.searchTopic || 'random';
        const response = await fetch(
          `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${PUBLIC_FLICKR_API_KEY}&text=${$latestSearchResult.searchTerm}&safe_search=1&content_type=1&sort=interestingness-desc&per_page=20&format=json&page=${page}`,
        )
          .then(r => r.text())
          .then(t => JSON.parse(t.substring(14, t.length - 1)));
        $latestSearchResult.page = response.photos.page;
        $latestSearchResult.totalPages = response.photos.pages;
        $latestSearchResult.images = response.photos.photo.map(
          (m: any) => `http://farm${m.farm}.static.flickr.com/${m.server}/${m.id}_${m.secret}_z.jpg`,
        );
      }

      const randomIndex = Math.floor(Math.random() * $latestSearchResult.images.length);
      activeImageUrl = $latestSearchResult.images.splice(randomIndex, 1)[0];

      await storage.local.set({ [storageKey]: $latestSearchResult });
    }
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="w-full h-full object-cover select-none bg-surface-200" draggable="false" src={activeImageUrl} />
