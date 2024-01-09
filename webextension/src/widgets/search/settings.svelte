<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';
  import type { Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { searchProvider, font, textColor, backgroundBlur, backgroundColor, searchSuggestionEnabled } = settings;
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Search_Settings_SearchProvider()}</span>
    <select class="select" bind:value={$searchProvider}>
      <option value="duckduckgo">DuckDuckGo</option>
      <option value="google">Google</option>
      <option value="bing">Bing</option>
      <option value="youtube">YouTube</option>
    </select>
  </label>
  <div class="label mb-2">
    <span>{m.Widgets_Search_Settings_SearchSuggestionsEnabled()}</span>
    <div>
      <SlideToggle name="searchSuggestionEnabled" size="sm" bind:checked={$searchSuggestionEnabled} />
    </div>
  </div>
{:else if tab === TextTabId}
  <div>
    <div class="label">
      <span>{m.Widgets_Search_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_Search_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Search_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
