<script lang="ts">
  import DynamicSizeText from '$shared-components/dynamic-size-text.svelte';
  import type { Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale, localeCharSubset } from '$stores/locale';
  import { minutesToMilliseconds } from 'date-fns';

  let clockStore = getClockStore(minutesToMilliseconds(1));
  let dateDisplay: DynamicSizeText | null;
  export let settings: Settings;

  const {
    font: { id: fontId, weight: fontWeight },
    textShadow: {
      blur: textShadowBlur,
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      color: textShadowColor,
    },
    backgroundBlur,
    textColor,
    backgroundColor,
  } = settings;

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
  class="w-full h-full p-4 select-none flex justify-center content-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  use:fontsource={{
    font: $fontId,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  on:fontChanged={redrawAll}>
  <DynamicSizeText bind:this={dateDisplay} text={date} class="max-h-[100cqh] max-w-[100cqw] cursor-default" />
</div>
