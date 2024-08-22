<script lang="ts">
  import type { Settings } from './settings';
  import { TextTabId, TimeTabId, BackgroundTabId } from './settings-tabs';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { textColor, timeTextColor, backgroundColor, backgroundBlur, textStroke } = settings;
</script>

{#if tab === TextTabId}
  <TextSettings font={settings.font} bind:color={$textColor} shadow={settings.textShadow} stroke={textStroke} />
{:else if tab === TimeTabId}
  <TextSettings
    font={settings.timeFont}
    bind:color={$timeTextColor}
    shadow={settings.timeTextShadow}
    stroke={settings.timeTextStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
