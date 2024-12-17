<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_AdviceSlip_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_AdviceSlip_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import NumberInput from '$shared-components/number-input.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { minutesToSeconds, secondsToMinutes } from 'date-fns';
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let updateInterval = $state(secondsToMinutes(settings.updateInterval.value));

  $effect(() => {
    settings.updateInterval.value = minutesToSeconds(Math.max(updateInterval, 1));
  });

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_AdviceSlip_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
