<script lang="ts">
  import { IconSource, type Settings } from './settings';
  import * as m from '$i18n/messages';
  import { BackgroundTabId, IconTabId, TextTabId } from './settings-tabs';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import IconifySearch from './iconify-search.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';

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
  <TextSettings {font} bind:color={$textColor} shadow={textShadow} />
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Link_Settings_Background_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Link_Settings_Background_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
