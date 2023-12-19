<script lang="ts">
  import { IconSource, type Settings } from './settings';
  import * as m from '$i18n/messages';
  import { BackgroundTabId, IconTabId } from './settings-tabs';
  import { GeneralTabId } from '$components/widget-settings.svelte';
  import ColorPicker from '$components/color-picker.svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import IconifySearch from './iconify-search.svelte';

  export let settings: Settings;
  export let tab: number;

  function onIconSourceChange() {
    $settings.icon = '';
  }
</script>

{#if tab === GeneralTabId}
  <label class="label">
    <span>{m.Widgets_Link_Settings_Link_Label()}</span>
    <input
      type="url"
      class="input"
      bind:value={$settings.url}
      placeholder={m.Widgets_Link_Settings_Link_Placeholder()} />
  </label>
{:else if tab === IconTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Link_Settings_IconSource()}</span>
    <select class="select" bind:value={$settings.iconSource} on:change={onIconSourceChange}>
      <option value={IconSource.Favicon}>{m.Widgets_Link_Settings_IconSource_Favicon()}</option>
      <option value={IconSource.Iconify}>{m.Widgets_Link_Settings_IconSource_Iconify()}</option>
      <option value={IconSource.Direct}>{m.Widgets_Link_Settings_IconSource_Direct()}</option>
    </select>
  </label>
  {#if $settings.iconSource === IconSource.Direct}
    <label class="label">
      <span>{m.Widgets_Link_Settings_IconSource_Direct_Label()}</span>
      <input
        type="url"
        class="input"
        bind:value={$settings.icon}
        placeholder={m.Widgets_Link_Settings_IconSource_Direct_Placeholder()} />
    </label>
  {:else if $settings.iconSource === IconSource.Iconify}
    <IconifySearch bind:icon={$settings.icon} bind:color={$settings.iconColor} />
  {/if}
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Link_Settings_Background_Color()}</span>
    <div>
      <ColorPicker bind:color={$settings.backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Link_Settings_Background_Blur()}</span>
    <RangeSlider name="range-slider" bind:value={$settings.backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
