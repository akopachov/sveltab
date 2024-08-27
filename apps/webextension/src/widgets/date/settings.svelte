<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Date_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Date_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { textColor, backgroundColor, backgroundBlur, textStroke } = settings;
</script>

{#if tab === TextTabId}
  <TextSettings font={settings.font} bind:color={$textColor} shadow={settings.textShadow} stroke={textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
