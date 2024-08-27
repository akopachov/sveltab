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
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { name, font, textColor, backgroundColor, backgroundBlur } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Greeting_Settings_Name()}</span>
    <input type="text" class="input" bind:value={$name} />
  </label>
{:else if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
