<script lang="ts">
  import { IconSource, type Settings } from './settings';
  import * as m from '$i18n/messages';
  import { BackgroundTabId, IconTabId, TextTabId } from './settings-tabs';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import IconifySearch from './iconify-search.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { icon, url, iconSource, iconColor, backgroundColor, backgroundBlur, textColor, font, textShadow, title } =
    settings;

  function onIconSourceChange() {
    $icon = '';
  }
</script>

{#if tab === GeneralTabId}
  <label class="label">
    <span>{m.Widgets_Link_Settings_Link_Label()}</span>
    <input type="url" class="input" bind:value={$url} placeholder={m.Widgets_Link_Settings_Link_Placeholder()} />
  </label>
  <label class="label">
    <span>{m.Widgets_Link_Settings_Title_Label()}</span>
    <input type="text" class="input" bind:value={$title} />
  </label>
{:else if tab === IconTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Link_Settings_IconSource()}</span>
    <select class="select" bind:value={$iconSource} on:change={onIconSourceChange}>
      <option value={IconSource.Favicon}>{m.Widgets_Link_Settings_IconSource_Favicon()}</option>
      <option value={IconSource.Iconify}>{m.Widgets_Link_Settings_IconSource_Iconify()}</option>
      <option value={IconSource.Direct}>{m.Widgets_Link_Settings_IconSource_Direct()}</option>
    </select>
  </label>
  {#if $iconSource === IconSource.Direct}
    <label class="label">
      <span>{m.Widgets_Link_Settings_IconSource_Direct_Label()}</span>
      <input
        type="url"
        class="input"
        bind:value={$icon}
        placeholder={m.Widgets_Link_Settings_IconSource_Direct_Placeholder()} />
    </label>
  {:else if $iconSource === IconSource.Iconify}
    <IconifySearch bind:icon={$icon} bind:color={$iconColor} />
  {/if}
{:else if tab === TextTabId}
  <TextSettings {font} bind:color={$textColor} shadow={textShadow} stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
