<script lang="ts">
  import FilterSelector from '$shared-components/filter-selector.svelte';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { ImageResizeType } from '$lib/cdn';
  import type { ImageBackgroundProviderSettingsBase } from './settings-base';

  let {
    settings,
    provider,
  }: { settings: ImageBackgroundProviderSettingsBase; provider?: { href: string; name: string } } = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="my-2">
  {m.Backgrounds_ImageCommon_Settings_ResizeType()}
  <RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
    <RadioItem bind:group={settings.resizeType.value} name="resize_cover" value={ImageResizeType.Cover}>
      {m.Backgrounds_ImageCommon_Settings_ResizeType_Cover()}
    </RadioItem>
    <RadioItem bind:group={settings.resizeType.value} name="resize_contain" value={ImageResizeType.Contain}>
      {m.Backgrounds_ImageCommon_Settings_ResizeType_Contain()}
    </RadioItem>
  </RadioGroup>
</label>
<label class="label mb-2">
  <span>{m.Backgrounds_ImageCommon_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={settings.blur.value} min={0} max={15} step={0.1}></RangeSlider>
</label>
<label class="label mb-2">
  <span>{m.Backgrounds_ImageCommon_Settings_Filter()}</span>
  <FilterSelector bind:filter={settings.filter.value} />
</label>
<label class="label relative">
  <span>{m.Backgrounds_ImageCommon_Settings_Brightness()}</span>
  <RangeSlider name="brightnessSlider" bind:value={settings.brightness.value} min={0} max={2} step={0.01}>
    <div class="absolute top-2 right-0">
      <div class="text-xs">{settings.brightness.value}</div>
    </div>
  </RangeSlider>
</label>
{#if provider}
  <div>
    <span class="text-xs opacity-50">
      {m.Backgrounds_ImageCommon_Settings_Disclaimer()}
      <a class="anchor" href={provider.href} target="_blank" rel="noreferrer" referrerpolicy="no-referrer">
        {provider.name}
      </a>
    </span>
  </div>
{/if}
