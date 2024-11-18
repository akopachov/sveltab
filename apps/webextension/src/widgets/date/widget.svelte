<script lang="ts">
  import DynamicSizeText from '$shared-components/dynamic-size-text.svelte';
  import type { Settings } from './settings';
  import { getPreciselyAlignedClockStore } from '$stores/clock-store';
  import { fontsource } from '$actions/fontsource';
  import { locale, localeCharSubset } from '$stores/locale';
  import { minutesToMilliseconds } from 'date-fns';

  let clockStore = getPreciselyAlignedClockStore(minutesToMilliseconds(1));
  let dateDisplay: ReturnType<typeof DynamicSizeText> | undefined = $state();
  let { settings }: { settings: Settings } = $props();

  let intlFormat = $derived(
    new Intl.DateTimeFormat($locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  );

  let date = $derived(intlFormat.format($clockStore));

  function redrawAll() {
    dateDisplay?.refresh();
  }
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center [&>*]:drop-shadow-[var(--st-shadow)] backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:--st-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  use:fontsource={{
    font: settings.font.id.value,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  onfontChanged={redrawAll}>
  <DynamicSizeText
    bind:this={dateDisplay}
    text={date}
    class="max-h-[100cqh] max-w-[100cqw] cursor-default"
    stroke={settings.textStroke} />
</div>
