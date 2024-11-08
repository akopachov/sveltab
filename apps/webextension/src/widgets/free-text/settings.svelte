<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_FreeText_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_FreeText_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { TextAlign, type Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_FreeText_Settings_Text()}</span>
    <textarea class="textarea" bind:value={settings.text.value}></textarea>
  </div>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_FreeText_Settings_Align()}</span>
      <div class="w-fit">
        <RadioGroup display="flex" padding="px-4 py-1 leading-none">
          <RadioItem bind:group={settings.textAlign.value} name="justify" value={TextAlign.Left}>
            <span class="icon-[fa6-solid--align-left]"></span>
          </RadioItem>
          <RadioItem bind:group={settings.textAlign.value} name="justify" value={TextAlign.Middle}>
            <span class="icon-[fa6-solid--align-center]"></span>
          </RadioItem>
          <RadioItem bind:group={settings.textAlign.value} name="justify" value={TextAlign.Right}>
            <span class="icon-[fa6-solid--align-right]"></span>
          </RadioItem>
        </RadioGroup>
      </div>
    </div>
    <TextSettings
      font={settings.font}
      bind:color={settings.textColor.value}
      shadow={settings.textShadow}
      stroke={settings.textStroke} />
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
