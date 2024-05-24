<script lang="ts">
  import FilterSelector from '$shared-components/filter-selector.svelte';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { ImageResizeType } from '$lib/cdn';
  import type { ImageBackgroundProviderSettingsBase } from './settings-base';

  export let settings: ImageBackgroundProviderSettingsBase;
  export let provider: { href: string; name: string } | undefined = undefined;

  const { resizeType, blur, filter } = settings;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
  {m.Backgrounds_ImageCommon_Settings_ResizeType()}
  <RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
    <RadioItem bind:group={$resizeType} name="resize_cover" value={ImageResizeType.Cover}>
      {m.Backgrounds_ImageCommon_Settings_ResizeType_Cover()}
    </RadioItem>
    <RadioItem bind:group={$resizeType} name="resize_contain" value={ImageResizeType.Contain}>
      {m.Backgrounds_ImageCommon_Settings_ResizeType_Contain()}
    </RadioItem>
  </RadioGroup>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_ImageCommon_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_ImageCommon_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
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
