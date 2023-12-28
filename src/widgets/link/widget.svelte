<script lang="ts">
  import debounce from 'debounce';
  import { imgSrcEx } from '$actions/img-src-ex';
  import { IconSource, type Settings } from './settings';
  import { onMount } from 'svelte';
  import { getSvgUrl } from '../../lib/iconify-api';
  import { secondsToMilliseconds } from 'date-fns';

  export let settings: Settings;

  let iconUrl: string | undefined;

  $: {
    $settings && updateIconUrlDebounced();
  }

  function ensureFqdnUrl(url: string | null | undefined) {
    url = url?.trim();
    if (url && url.match('^http(s)?://')) return url;
    return `https://${url}`;
  }

  const updateIconUrlDebounced = debounce(updateIconUrl, secondsToMilliseconds(1));
  function updateIconUrl() {
    if ($settings.iconSource === IconSource.Favicon) {
      let urlToParse = ensureFqdnUrl($settings.url);
      if (URL.canParse(urlToParse)) {
        iconUrl = `https://favicon.twenty.com/${new URL(urlToParse).hostname}`;
      } else {
        iconUrl = undefined;
      }
    } else if ($settings.iconSource === IconSource.Direct) {
      iconUrl = $settings.icon;
    } else if ($settings.iconSource === IconSource.Iconify) {
      iconUrl = getSvgUrl($settings.icon, $settings.iconColor);
    }
  }

  onMount(() => {
    updateIconUrl();
  });
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
  href={ensureFqdnUrl($settings.url)}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-[5cqmin] rounded-[inherit]"
  style:background-color={$settings.backgroundColor}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  draggable="false"
  title={$settings.url}>
  {#if iconUrl}
    <img class="w-full h-full object-contain select-none !rounded-[inherit]" draggable="false" use:imgSrcEx={iconUrl} />
  {:else}
    <span class="w-full h-full icon-[bx--image]"></span>
  {/if}
</a>
