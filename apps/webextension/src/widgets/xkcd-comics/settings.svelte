<script module lang="ts">
  import * as m from '$i18n/messages';

  const ImageTabId = 1;

  const Tabs = [
    {
      id: ImageTabId,
      title: () => m.Widgets_XKCDComics_Settings_Tabs_Image(),
    },
  ];
</script>

<script lang="ts">
  import { XKCDComicsStream, type Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import { minutesToSeconds, secondsToMinutes } from 'date-fns';
  import { onMount } from 'svelte';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import ColorPicker from '$shared-components/color-picker.svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let updateIntervalMinutes = $state(secondsToMinutes(settings.updateInterval.value));

  $effect(() => {
    settings.updateInterval.value = minutesToSeconds(Math.max(updateIntervalMinutes, 1));
  });

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === ImageTabId}
  <label class="label mb-2">
    <span>{m.Widgets_XKCDComics_Settings_Stream()}</span>
    <RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
      <RadioItem bind:group={settings.stream.value} name="resize_cover" value={XKCDComicsStream.Latest}>
        {m.Widgets_XKCDComics_Settings_Stream_Latest()}
      </RadioItem>
      <RadioItem bind:group={settings.stream.value} name="resize_contain" value={XKCDComicsStream.Random}>
        {m.Widgets_XKCDComics_Settings_Stream_Random()}
      </RadioItem>
    </RadioGroup>
  </label>
  {#if settings.stream.value === XKCDComicsStream.Random}
    <div class="label mb-2">
      <span>{m.Widgets_XKCDComics_Settings_UpdateInterval()}</span>
      <NumberInput bind:value={updateIntervalMinutes} min={1} />
    </div>
  {/if}
  <div class="label">
    <span>{m.Widgets_XKCDComics_Settings_Background()}</span>
    <div>
      <ColorPicker bind:color={settings.backgroundColor.value} />
    </div>
  </div>
  <div>
    <span class="text-xs opacity-50">
      {m.Widgets_XKCDComics_Settings_Disclaimer()}
      <a href="https://xkcd.com/" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">xkcd</a>
    </span>
  </div>
{/if}
