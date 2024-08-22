<script lang="ts">
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { TextAlign, type Settings } from './settings';
  import { TextTabId, BackgroundTabId } from './settings-tabs';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

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
    <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
