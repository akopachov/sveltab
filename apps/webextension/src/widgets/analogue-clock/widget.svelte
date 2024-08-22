<script lang="ts">
  import type { AnalogueClockSettings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { secondsToMilliseconds } from 'date-fns';
  import InlineSvg from './inline-svg.svelte';
  import { Watchfaces } from './watchfaces';
  import { derived } from 'svelte/store';

  let clockStore = getPreciselyAlignedClockStore(secondsToMilliseconds(1));

  export let settings: AnalogueClockSettings;

  const {
    backgroundColor,
    backgroundBlur,
    watchfaceColor,
    hourMarksColor,
    hourArmColor,
    minuteArmColor,
    secondArmColor,
    displaySecondArm,
    watchface,
    watchfaceBackgroundColor,
    shadow: { color: shadowColor, offsetX: shadowOffsetX, offsetY: shadowOffsetY, blur: shadowBlur },
  } = settings;

  const totalHours = derived<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const hours = date.getHours();
      update(v => v - (v % 24) + (v % 24 > hours ? 24 : 0) + hours);
    },
    $clockStore.getHours(),
  );
  const totalMinutes = derived<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const minutes = date.getMinutes();
      update(v => v - (v % 60) + (v % 60 > minutes ? 60 : 0) + minutes);
    },
    $clockStore.getMinutes(),
  );
  const totalSeconds = derived<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const seconds = date.getSeconds();
      update(v => v - (v % 60) + (v % 60 > seconds ? 60 : 0) + seconds);
    },
    $clockStore.getSeconds(),
  );
  $: watchfaceDef = Watchfaces.get($watchface);
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={$backgroundColor}
  style:--watchface-background-color={$watchfaceBackgroundColor}
  style:--watchface-color={$watchfaceColor}
  style:--hour-marks-color={$hourMarksColor}
  style:--hour-arm-color={$hourArmColor}
  style:--minute-arm-color={$minuteArmColor}
  style:--second-arm-color={$secondArmColor}
  style:--second-arm-visibility={$displaySecondArm ? 'visible' : 'hidden'}
  style:--st-blur="{$backgroundBlur}px"
  style:--st-shadow="{$shadowOffsetX}cqmin {$shadowOffsetY}cqmin {$shadowBlur}cqmin
  {$shadowColor}"
  style:--time-total-hours={$totalHours}
  style:--time-total-minutes={$totalMinutes}
  style:--time-total-seconds={$totalSeconds}
  style:--time-hours={$clockStore.getHours()}
  style:--time-minutes={$clockStore.getMinutes()}
  style:--time-seconds={$clockStore.getSeconds()}>
  {#if watchfaceDef}
    <InlineSvg src={watchfaceDef.uri} />
  {/if}
</div>
