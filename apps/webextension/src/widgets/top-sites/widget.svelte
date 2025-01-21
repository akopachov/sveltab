<script lang="ts">
  import { type Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { topSites } from './top-sites-store';
  import { getFavIconUrl } from '$lib/favicon-provider';
  import { imgSrcEx } from '$actions/img-src-ex';
  import * as m from '$i18n/messages';
  import { textStroke } from '$actions/text-stroke';

  let { settings }: { settings: Settings } = $props();

  export const overrideBorder = true;

  function getTopSites(limit: number) {
    if (import.meta.env.VITE_TARGET_BROWSER === 'firefox') {
      return topSites.get({ limit: Math.min(limit, 100) });
    } else {
      return topSites.get().then(r => r.slice(0, limit));
    }
  }

  let listPromise = $derived(getTopSites(settings.rowsCount.value * settings.itemsPerRow.value));
</script>

{#await listPromise then list}
  {#if list && list.length > 0}
    <div
      class="max-w-full max-h-full grid gap-1"
      style:grid-template-columns="repeat({Math.min(settings.itemsPerRow.value, list.length)}, minmax(0, 1fr))"
      style:grid-template-rows="repeat({Math.min(
        settings.rowsCount.value,
        Math.max(1, Math.floor(list.length / settings.itemsPerRow.value)),
      )}, minmax(0, 1fr))"
      use:textStroke={settings.textStroke}>
      {#each list as item (item.url)}
        <a
          href={item.url}
          rel="noreferrer"
          referrerpolicy="no-referrer"
          class="w-full h-full min-h-0 min-w-0 rounded-[var(--st-border-radius)] layout-{settings.titlePosition
            .value} btn [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] border-[color:var(--st-border-color)] [border-width:var(--st-border-size)] [-webkit-text-stroke:var(--sv-text-stroke)] !p-[--st-padding]"
          style:--st-padding="{5 / Math.min(settings.rowsCount.value, settings.itemsPerRow.value)}cqmin"
          style:background-color={settings.backgroundColor.value}
          style:--st-blur="{settings.backgroundBlur.value}px"
          style:font-size="{settings.font.size.value}cqmin"
          class:has-title={settings.showTitle.value}
          draggable="false"
          title={item.url}
          style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
            .textShadow.blur.value}cqmin
          {settings.textShadow.color.value}">
          <img
            class="img object-contain select-none rounded-[calc(var(--st-border-radius)-var(--st-padding))]"
            draggable="false"
            alt=""
            data-fallback="true"
            data-preload="true"
            use:imgSrcEx={getFavIconUrl(item.url)} />
          {#if settings.showTitle.value && item.title}
            <span
              class="title overflow-hidden min-h-[1em] text-ellipsis leading-normal h-[1.5em] !m-0 [-webkit-text-stroke:var(--sv-text-stroke)]"
              style:color={settings.textColor.value}
              style:font-weight={settings.font.weight.value}
              use:fontsource={{
                font: settings.font.id.value,
                subsets: $userPosssibleLocaleCharSubset,
                styles: ['normal'],
                weights: [settings.font.weight.value],
              }}>
              {item.title}
            </span>
          {/if}
        </a>
      {/each}
    </div>
  {:else}
    <h4
      class="h-4 w-full leading-[100cqh] text-center [-webkit-text-stroke:var(--sv-text-stroke)]"
      use:textStroke={settings.textStroke}>
      {m.Widgets_TopSites_NoMostVisitedSites()}
    </h4>
  {/if}
{/await}

<style lang="postcss">
  .layout-top,
  .layout-bottom {
    @apply grid h-full w-full grid-cols-1;

    &.has-title {
      @apply [grid-gap:--st-padding];
    }
    .img {
      @apply h-full w-full [grid-column:1];
    }
    .title {
      @apply w-full [grid-column:1];
    }
  }

  .layout-top {
    @apply grid-rows-[1fr_minmax(0,100%)];
    .title {
      @apply [grid-row:1];
    }
    .img {
      @apply [grid-row:2];
    }
  }

  .layout-bottom {
    @apply grid-rows-[minmax(0,100%)_1fr];
    .title {
      @apply [grid-row:2];
    }
    .img {
      @apply [grid-row:1];
    }
  }

  .layout-left,
  .layout-right {
    @apply flex h-full w-full;
    &.has-title {
      @apply gap-[--st-padding];
    }
    .img {
      @apply h-full w-fit;
    }
    .title {
      @apply flex-1;
    }
  }

  .layout-left {
    @apply flex-row-reverse;
  }

  .layout-right {
    @apply flex-row;
  }
</style>
