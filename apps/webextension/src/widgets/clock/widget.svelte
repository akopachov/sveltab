<script lang="ts">
  import DynamicSizeText from '$shared-components/dynamic-size-text.svelte';
  import { ClockFormat, type Settings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale } from '$stores/locale';
  import { minutesToMilliseconds } from 'date-fns';

  let clockStore = getPreciselyAlignedClockStore(minutesToMilliseconds(1));
  let timeDisplay: DynamicSizeText | null;

  export let settings: Settings;

  const {
    clockFormat,
    backgroundColor,
    backgroundBlur,
    textColor,
    font: { weight: fontWeight, id: fontId },
    textShadow: {
      color: textShadowColor,
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
    },
    textStroke,
  } = settings;

  $: intlFormat = new Intl.DateTimeFormat($locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: $clockFormat == ClockFormat.TwelveHrs,
  });
  $: time = intlFormat.format($clockStore);

  function redrawAll() {
    timeDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)] [font-display:swap]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:--st-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  use:fontsource={{
    font: $fontId,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  on:fontChanged={redrawAll}>
  <DynamicSizeText
    bind:this={timeDisplay}
    text={time}
    class="max-h-[100cqh] max-w-[100cqw] cursor-default"
    stroke={textStroke} />
</div>
