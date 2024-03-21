<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import { TextAlign, type Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import FontSelector from '$shared-components/font-selector.svelte';
  import * as m from '$i18n/messages';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';

  export let settings: Settings;
  export let tab: number;

  const { font, textColor, backgroundColor, backgroundBlur, text, textAlign } = settings;
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_FreeText_Settings_Text()}</span>
    <textarea class="textarea" bind:value={$text}></textarea>
  </div>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_FreeText_Settings_Align()}</span>
      <div class="w-fit">
        <RadioGroup display="flex" padding="px-4 py-1 leading-none">
          <RadioItem bind:group={$textAlign} name="justify" value={TextAlign.Left}>
            <span class="icon-[fa6-solid--align-left]"></span>
          </RadioItem>
          <RadioItem bind:group={$textAlign} name="justify" value={TextAlign.Middle}>
            <span class="icon-[fa6-solid--align-center]"></span>
          </RadioItem>
          <RadioItem bind:group={$textAlign} name="justify" value={TextAlign.Right}>
            <span class="icon-[fa6-solid--align-right]"></span>
          </RadioItem>
        </RadioGroup>
      </div>
    </div>
    <div class="label mb-2">
      <span>{m.Widgets_FreeText_Settings_Font()}</span>
      <FontSelector {font} bind:color={$textColor} />
    </div>
    <div>
      <h4>{m.Widgets_FreeText_Settings_Shadow()}</h4>
      <div class="pl-4 pr-4">
        <ShadowSelector shadowSettings={settings.textShadow} />
      </div>
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <div class="label">
    <span>{m.Widgets_FreeText_Settings_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_FreeText_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1} />
  </label>
{/if}
