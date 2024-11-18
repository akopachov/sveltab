<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Clock_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Clock_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { ClockFormat, type Settings } from './settings';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <!-- svelte-ignore -->
  <label class="label mb-2">
    <span class="block">{m.Widgets_Clock_Settings_Format()}</span>
    <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
      <RadioItem bind:group={settings.clockFormat.value} name="justify" value={ClockFormat.TwelveHrs}>
        {m.Widgets_Clock_Settings_Format_12Hrs()}
      </RadioItem>
      <RadioItem bind:group={settings.clockFormat.value} name="justify" value={ClockFormat.TwentyFourHrs}>
        {m.Widgets_Clock_Settings_Format_24Hrs()}
      </RadioItem>
    </RadioGroup>
  </label>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
