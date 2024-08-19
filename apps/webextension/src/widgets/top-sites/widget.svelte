<script lang="ts">
  import { type Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { topSites } from './top-sites-store';
  import { getFavIconUrl } from '$lib/favicon-provider';
  import { imgSrcEx } from '$actions/img-src-ex';
  import * as m from '$i18n/messages';
  import { isFirefox } from '$lib/browsers-check';
  import { textStroke } from '$actions/text-stroke';

  export let settings: Settings;
  export const overrideBorder = true;

  function getTopSites(limit: number) {
    if (isFirefox) {
      return topSites.get({ limit: Math.min(limit, 100) });
    }

    return topSites.get().then(r => r.slice(0, limit));
  }

  $: listPromise = getTopSites($rowsCount * $itemsPerRow);

  const {
    itemsPerRow,
    rowsCount,
    showTitle,
    backgroundColor,
    backgroundBlur,
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
</script>

{#await listPromise then list}
  {#if list && list.length > 0}
    <div
      class="max-w-full max-h-full grid gap-1"
      style:grid-template-columns="repeat({Math.min($itemsPerRow, list.length)}, minmax(0, 1fr))"
      style:grid-template-rows="repeat({Math.min($rowsCount, Math.max(1, Math.floor(list.length / $itemsPerRow)))},
      minmax(0, 1fr))"
      use:textStroke={textStrokeSettings}>
      {#each list as item (item.url)}
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          href={item.url}
          rel="noreferrer"
          referrerpolicy="no-referrer"
          class="btn min-h-0 min-w-0 rounded-[var(--st-border-radius)] flex flex-col [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] overflow-hidden border-[color:var(--st-border-color)] [border-width:var(--st-border-size)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:padding="{5 / Math.min($rowsCount, $itemsPerRow)}cqmin"
          style:background-color={$backgroundColor}
          style:--st-blur="{$backgroundBlur}px"
          style:font-size="{$fontSize}cqmin"
          draggable="false"
          title={item.url}
          style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
          {$textShadowColor}">
          <img
            class="w-full h-full object-contain select-none !rounded-[inherit]"
            draggable="false"
            data-fallback="true"
            use:imgSrcEx={getFavIconUrl(item.url)} />
          {#if $showTitle && item.title}
            <div
              class="w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 leading-normal !m-0"
              style:color={$textColor}
              style:font-weight={$fontWeight}
              use:fontsource={{
                font: $fontId,
                subsets: $userPosssibleLocaleCharSubset,
                styles: ['normal'],
                weights: [$fontWeight],
              }}>
              {item.title}
            </div>
          {/if}
        </a>
      {/each}
    </div>
  {:else}
    <h4
      class="h-4 w-full leading-[100cqh] text-center [-webkit-text-stroke:var(--sv-text-stroke)]"
      use:textStroke={textStrokeSettings}>
      {m.Widgets_TopSites_NoMostVisitedSites()}
    </h4>
  {/if}
{/await}
