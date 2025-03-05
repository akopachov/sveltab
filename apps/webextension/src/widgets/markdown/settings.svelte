<script module lang="ts">
  const TextTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: TextTabId,
      title: () => m.Widgets_Markdown_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Markdown_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { onMount } from 'svelte';
  import pDebounce from 'p-debounce';
  import { Lazy } from '$lib/lazy';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  let { settings, tabs = $bindable(), tab }: { settings: Settings; tab: number; tabs: object[] } = $props();
  let markdownRenderer = new Lazy(() =>
    import('markdown-it')
      .then(m => m.default)
      .then(r =>
        r({
          html: true,
          xhtmlOut: true,
          linkify: true,
        }),
      ),
  );

  async function updateHtml() {
    const renderer = await markdownRenderer.value;
    settings.html.value = renderer.render(settings.markdown.value);
  }

  const updateHtmlDebounced = pDebounce(updateHtml, 100);

  onMount(() => {
    tabs = Tabs;
    if (settings.markdown.value && !settings.html.value) {
      updateHtml();
    }
  });
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_Markdown_Settings_Markdown()}</span>
    <textarea class="textarea" bind:value={settings.markdown.value} oninput={updateHtmlDebounced}></textarea>
  </div>
{:else if tab === TextTabId}
  <div>
    <TextSettings
      font={settings.font}
      bind:color={settings.textColor.value}
      shadow={settings.textShadow}
      stroke={settings.textStroke} />
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
