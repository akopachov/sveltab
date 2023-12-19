<script lang="ts">
  import debounce from 'debounce';
  import { insistentImageLoader } from '$widgets/link/insistent-image-loader';
  import { getSvgUrls } from './iconify-api';
  import { IconSource, type Settings } from './settings';
  import { onMount } from 'svelte';

  export let settings: Settings;

  let iconUrls: string[] = [];

  $: {
    $settings && updateIconUrlDebounced();
  }

  function ensureFqdnUrl(url: string | null | undefined) {
    url = url?.trim();
    if (url && url.match('^http(s)?://')) return url;
    return `https://${url}`;
  }

  const updateIconUrlDebounced = debounce(updateIconUrl, 1000);
  function updateIconUrl() {
    if ($settings.iconSource === IconSource.Favicon) {
      let urlToParse = ensureFqdnUrl($settings.url);
      if (URL.canParse(urlToParse)) {
        iconUrls = [`https://favicon.twenty.com/${new URL(urlToParse).hostname}`];
      } else {
        iconUrls = [];
      }
    } else if ($settings.iconSource === IconSource.Direct) {
      iconUrls = $settings.icon ? [$settings.icon] : [];
    } else if ($settings.iconSource === IconSource.Iconify) {
      iconUrls = getSvgUrls($settings.icon, $settings.iconColor);
    }
  }

  onMount(() => {
    updateIconUrl();
  });
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
  href={ensureFqdnUrl($settings.url)}
  class="w-full h-full btn !p-[5cqmin] rounded-[inherit]"
  style:background-color={$settings.backgroundColor}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  draggable="false"
  title={$settings.url}>
  {#if iconUrls.length > 0}
    <img
      class="w-full h-full object-contain select-none !rounded-[inherit]"
      draggable="false"
      use:insistentImageLoader={{ urls: iconUrls }} />
  {:else}
    <span class="w-full h-full icon-[bx--image]"></span>
  {/if}
</a>
