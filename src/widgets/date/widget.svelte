<script lang="ts">
  import DynamicSizeText from '$components/dynamic-size-text.svelte';
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale, localeCharSubset } from '$stores/locale';

  let clockStore = getClockStore(60000);
  let dateDisplay: DynamicSizeText | null;
  export let settings: Settings;

  $: fontSettings = settings.font;
  $: textShadowSettings = settings.textShadow;

  $: intlFormat = new Intl.DateTimeFormat($locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  $: date = intlFormat.format($clockStore);

  function redrawAll() {
    dateDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center [&>*]:drop-shadow-[var(--st-shadow)]"
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  style:--st-shadow="{$textShadowSettings.offsetX}cqmin {$textShadowSettings.offsetY}cqmin {$textShadowSettings.blur}cqmin
  {$textShadowSettings.color}"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}
  on:fontChanged={redrawAll}>
  <DynamicSizeText bind:this={dateDisplay} text={date} class="max-h-[100cqh] max-w-[100cqw] cursor-default" />
</div>
