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
          class="btn min-h-0 min-w-0 rounded-[var(--st-border-radius)] flex flex-col [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] overflow-hidden border-[color:var(--st-border-color)] [border-width:var(--st-border-size)] [-webkit-text-stroke:var(--sv-text-stroke)]"
          style:padding="{5 / Math.min(settings.rowsCount.value, settings.itemsPerRow.value)}cqmin"
          style:background-color={settings.backgroundColor.value}
          style:--st-blur="{settings.backgroundBlur.value}px"
          style:font-size="{settings.font.size.value}cqmin"
          draggable="false"
          title={item.url}
          style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
            .textShadow.blur.value}cqmin
          {settings.textShadow.color.value}">
          <img
            class="w-full h-full object-contain select-none !rounded-[inherit]"
            draggable="false"
            alt=""
            data-fallback="true"
            use:imgSrcEx={getFavIconUrl(item.url)} />
          {#if settings.showTitle.value && item.title}
            <div
              class="w-full overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0 leading-normal !m-0"
              style:color={settings.textColor.value}
              style:font-weight={settings.font.weight.value}
              use:fontsource={{
                font: settings.font.id.value,
                subsets: $userPosssibleLocaleCharSubset,
                styles: ['normal'],
                weights: [settings.font.weight.value],
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
      use:textStroke={settings.textStroke}>
      {m.Widgets_TopSites_NoMostVisitedSites()}
    </h4>
  {/if}
{/await}
