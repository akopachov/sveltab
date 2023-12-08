<script lang="ts">
  import DynamicSizeText from '$components/dynamic-size-text.svelte';
  import { ClockFormat, type Settings } from './settings';
  import { format } from 'date-fns';
  import { getClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';

  let clockStore = getClockStore(1000);
  let timeDisplay: DynamicSizeText | null;
  let amPmDisplay: DynamicSizeText | null;

  export let settings: Settings;

  $: fontSettings = settings.font;

  $: time = format($clockStore, $settings.clockFormat == ClockFormat.TwelveHrs ? 'h:mm' : 'kk:mm');
  $: amPm = $settings.clockFormat == ClockFormat.TwelveHrs ? format($clockStore, 'a') : '';

  function redrawAll() {
    timeDisplay?.refresh();
    amPmDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center"
  style:background-color={$settings.backgroundColor}
  style:color={$settings.textColor}
  style:font-weight={$fontSettings.weight}
  style:backdrop-filter="blur({$settings.backgroundBlur}px)"
  use:fontsource={{
    font: $fontSettings.id,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [$fontSettings.weight],
  }}
  on:fontChanged={redrawAll}>
  <DynamicSizeText bind:this={timeDisplay} text={time} class="max-h-[100cqh] max-w-[100cqw] cursor-default" />
  {#if amPm}
    <DynamicSizeText bind:this={amPmDisplay} text={amPm} class="max-h-[100cqh] ml-[5cqw] cursor-default" />
  {/if}
</div>
