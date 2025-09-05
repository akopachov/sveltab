<script lang="ts">
  import DynamicSizeText from '$shared-components/dynamic-size-text.svelte';
  import { ClockFormat, type Settings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale } from '$stores/locale';
  import { minutesToMilliseconds } from 'date-fns';

  let clockStore = getPreciselyAlignedClockStore(minutesToMilliseconds(1));
  let timeDisplay: ReturnType<typeof DynamicSizeText> | null;

  let { settings }: { settings: Settings } = $props();

  let timezone = $derived(
    settings.timezone.value === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : settings.timezone.value,
  );
  let intlFormat = $derived(
    new Intl.DateTimeFormat($locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: settings.clockFormat.value == ClockFormat.TwelveHrs,
      timeZone: timezone,
    }),
  );
  let time = $derived(intlFormat.format($clockStore));

  function redrawAll() {
    timeDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  use:fontsource={{
    font: settings.font.id.value,
    subsets: ['latin'],
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  onfontChanged={redrawAll}>
  <DynamicSizeText
    bind:this={timeDisplay}
    text={time}
    class="max-h-[100cqh] max-w-[100cqw] cursor-default"
    stroke={settings.textStroke} />
</div>
