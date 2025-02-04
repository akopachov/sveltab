<script module lang="ts">
  import * as m from '$i18n/messages';

  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Quote_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Quote_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import type { GreetingLanguage, Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';
  import { locale } from '$stores/locale';
  import { firstLetterToUpperCase } from '$lib/string-utils';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let langDisplayNames = $derived(new Intl.DisplayNames([$locale], { type: 'language' }));
  const availableLanguages: ReadonlyArray<Exclude<GreetingLanguage, 'default'>> = ['en', 'pl', 'be', 'es'] as const;

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Greeting_Settings_Name()}</span>
    <input type="text" class="input" bind:value={settings.name.value} />
  </label>
  <label class="label mb-2">
    <span>{m.Widgets_Greeting_Settings_Language()}</span>
    <select class="select" bind:value={settings.language.value}>
      <option value="default">{m.Widgets_Greeting_Settings_Language_Default()}</option>
      {#each availableLanguages as lang}
        <option value={lang}>{firstLetterToUpperCase(langDisplayNames.of(lang))}</option>
      {/each}
    </select>
  </label>
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
