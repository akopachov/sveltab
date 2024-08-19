<script lang="ts">
  import debounce from 'debounce';
  import { imgSrcEx } from '$actions/img-src-ex';
  import { IconSource, type Settings } from './settings';
  import { onMount } from 'svelte';
  import { getSvgUrl } from '../../lib/service-mirrors';
  import { secondsToMilliseconds } from 'date-fns';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { getFavIconUrl } from '$lib/favicon-provider';
  import { textStroke } from '$actions/text-stroke';

  export let settings: Settings;

  let iconUrl: string | undefined;

  const {
    icon,
    iconSource,
    url,
    iconColor,
    backgroundColor,
    backgroundBlur,
    title,
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textColor,
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  $: {
    ($iconSource || $icon || $url || $iconColor) && updateIconUrlDebounced();
  }

  function ensureFqdnUrl(url: string | null | undefined) {
    url = url?.trim();
    if (url && url.match('^http(s)?://')) return url;
    return `https://${url}`;
  }

  const updateIconUrlDebounced = debounce(updateIconUrl, secondsToMilliseconds(1));
  function updateIconUrl() {
    if ($iconSource === IconSource.Favicon) {
      let urlToParse = ensureFqdnUrl($url);
      if (URL.canParse(urlToParse)) {
        iconUrl = getFavIconUrl(urlToParse);
      } else {
        iconUrl = undefined;
      }
    } else if ($iconSource === IconSource.Direct) {
      iconUrl = $icon;
    } else if ($iconSource === IconSource.Iconify) {
      iconUrl = getSvgUrl($icon, $iconColor);
    }
  }

  onMount(() => {
    updateIconUrl();
  });
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
  href={ensureFqdnUrl($url)}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-[5cqmin] rounded-[inherit] flex flex-col [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:--st-blur="{$backgroundBlur}px"
  style:font-size="{$fontSize}cqmin"
  draggable="false"
  title={$url}
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}">
  {#if iconUrl}
    <img
      class="w-full h-full object-contain select-none !rounded-[inherit]"
      draggable="false"
      use:imgSrcEx={iconUrl}
      data-fallback="true" />
  {:else}
    <span class="w-full h-full icon-[bx--image] text-black"></span>
  {/if}
  {#if $title}
    <div
      class="w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 leading-normal !m-0 [-webkit-text-stroke:var(--sv-text-stroke)]"
      style:color={$textColor}
      style:font-weight={$fontWeight}
      use:fontsource={{
        font: $fontId,
        subsets: $userPosssibleLocaleCharSubset,
        styles: ['normal'],
        weights: [$fontWeight],
      }}
      use:textStroke={textStrokeSettings}>
      {$title}
    </div>
  {/if}
</a>
