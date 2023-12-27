<script lang="ts">
  import DynamicSizeText from '$components/dynamic-size-text.svelte';
  import { ClockFormat, type Settings } from './settings';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale } from '$stores/locale';
  import { secondsToMilliseconds } from 'date-fns';

  let clockStore = getClockStore(secondsToMilliseconds(1));
  let timeDisplay: DynamicSizeText | null;

  export let settings: Settings;

  $: fontSettings = settings.font;
  $: textShadowSettings = settings.textShadow;

  $: intlFormat = new Intl.DateTimeFormat($locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: $settings.clockFormat == ClockFormat.TwelveHrs,
  });
  $: time = intlFormat.format($clockStore);

  function redrawAll() {
    timeDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center [&>*]:drop-shadow-[var(--st-shadow)]"
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  style:--st-shadow="{$textShadowSettings.offsetX}cqmin {$textShadowSettings.offsetY}cqmin {$textShadowSettings.blur}cqmin
  {$textShadowSettings.color}"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}
  on:fontChanged={redrawAll}>
  <DynamicSizeText bind:this={timeDisplay} text={time} class="max-h-[100cqh] max-w-[100cqw] cursor-default" />
</div>
