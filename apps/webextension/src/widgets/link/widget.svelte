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
  import { opfsSrc } from '$actions/opfs-src';
  import type { InternalAssetsManager } from '$lib/internal-assets-manager';
  import { logger } from '$lib/logger';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Link'] });

  let { settings, internalAssetsManager }: { settings: Settings; internalAssetsManager: InternalAssetsManager } =
    $props();

  let iconUrl: string | undefined = $state();

  $effect(() => {
    void (settings.iconSource.value, settings.icon.value, settings.url.value, settings.iconColor.value);
    updateIconUrlDebounced();
  });

  export async function onDelete() {
    if (settings.iconSource.value === IconSource.Local && settings.icon.value) {
      try {
        internalAssetsManager.removeAsset(settings.icon.value);
      } catch (e) {
        log.warn(e);
      }
    }
  }

  function ensureFqdnUrl(url: string | null | undefined) {
    url = url?.trim();
    if (url && url.match('^http(s)?://')) return url;
    return `https://${url}`;
  }

  const updateIconUrlDebounced = debounce(updateIconUrl, secondsToMilliseconds(1));
  function updateIconUrl() {
    if (settings.iconSource.value === IconSource.Favicon) {
      let urlToParse = ensureFqdnUrl(settings.url.value);
      if (URL.canParse(urlToParse)) {
        iconUrl = getFavIconUrl(urlToParse);
      } else {
        iconUrl = undefined;
      }
    } else if (settings.iconSource.value === IconSource.Direct) {
      iconUrl = settings.icon.value;
    } else if (settings.iconSource.value === IconSource.Iconify) {
      iconUrl = getSvgUrl(settings.icon.value, settings.iconColor.value);
    } else {
      iconUrl = settings.icon.value;
    }
  }

  function conditionalSrc(node: HTMLImageElement, options: { src: string | undefined; iconSource: IconSource }) {
    if (options.iconSource === IconSource.Local) {
      return opfsSrc(node, options.src);
    }

    return imgSrcEx(node, options.src);
  }

  onMount(() => {
    updateIconUrl();
  });
</script>

<a
  href={ensureFqdnUrl(settings.url.value)}
  rel="noreferrer"
  referrerpolicy="no-referrer"
  class="w-full h-full btn !p-[5cqmin] rounded-[inherit] flex flex-col [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:font-size="{settings.font.size.value}cqmin"
  draggable="false"
  title={settings.url.value}
  style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}">
  {#if iconUrl}
    <img
      class="w-full h-full object-contain select-none rounded-[calc(var(--st-border-radius)-5cqmin)]"
      draggable="false"
      use:conditionalSrc={{ src: iconUrl, iconSource: settings.iconSource.value }}
      data-fallback="true"
      alt=" " />
  {:else}
    <span class="w-full h-full icon-[bx--image] text-black"></span>
  {/if}
  {#if settings.title.value}
    <div
      class="w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 leading-normal !m-0 [-webkit-text-stroke:var(--sv-text-stroke)]"
      style:color={settings.textColor.value}
      style:font-weight={settings.font.weight.value}
      use:fontsource={{
        font: settings.font.id.value,
        subsets: $userPosssibleLocaleCharSubset,
        styles: ['normal'],
        weights: [settings.font.weight.value],
      }}
      use:textStroke={settings.textStroke}>
      {settings.title.value}
    </div>
  {/if}
</a>
