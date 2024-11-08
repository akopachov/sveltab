<script lang="ts">
  import type { AnalogueClockSettings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { secondsToMilliseconds } from 'date-fns';
  import InlineSvg from './inline-svg.svelte';
  import { Watchfaces } from './watchfaces';
  import { derived as derivedStore } from 'svelte/store';

  let clockStore = getPreciselyAlignedClockStore(secondsToMilliseconds(1));

  let { settings }: { settings: AnalogueClockSettings } = $props();

  const totalHours = derivedStore<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const hours = date.getHours();
      update(v => v - (v % 24) + (v % 24 > hours ? 24 : 0) + hours);
    },
    $clockStore.getHours(),
  );
  const totalMinutes = derivedStore<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const minutes = date.getMinutes();
      update(v => v - (v % 60) + (v % 60 > minutes ? 60 : 0) + minutes);
    },
    $clockStore.getMinutes(),
  );
  const totalSeconds = derivedStore<typeof clockStore, number>(
    clockStore,
    (date, _set, update) => {
      const seconds = date.getSeconds();
      update(v => v - (v % 60) + (v % 60 > seconds ? 60 : 0) + seconds);
    },
    $clockStore.getSeconds(),
  );
  let watchfaceDef = $derived(Watchfaces.get(settings.watchface.value));
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:--watchface-background-color={settings.watchfaceBackgroundColor.value}
  style:--watchface-color={settings.watchfaceColor.value}
  style:--hour-marks-color={settings.hourMarksColor.value}
  style:--hour-arm-color={settings.hourArmColor.value}
  style:--minute-arm-color={settings.minuteArmColor.value}
  style:--second-arm-color={settings.secondArmColor.value}
  style:--second-arm-visibility={settings.displaySecondArm.value ? 'visible' : 'hidden'}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:--st-shadow="{settings.shadow.offsetX.value}cqmin {settings.shadow.offsetY.value}cqmin {settings.shadow.blur
    .value}cqmin
  {settings.shadow.color.value}"
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
