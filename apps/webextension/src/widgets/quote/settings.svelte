<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Quote_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Quote_Settings_Tabs_Background(),
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

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { updateInterval: updateIntervalObs, font, textColor, backgroundColor, backgroundBlur } = settings;

  let updateInterval = secondsToMinutes($updateIntervalObs);
  $: {
    $updateIntervalObs = minutesToSeconds(Math.max(updateInterval, 1));
  }
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_Quote_Settings_UpdateInterval()}</span>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={$textColor}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
