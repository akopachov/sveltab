<script module lang="ts">
  const Tabs: never[] = [];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import { onMount } from 'svelte';

  let { settings, tabs = $bindable(), tab }: { settings: Settings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_Html_Settings_Html()}</span>
    <textarea class="textarea" bind:value={settings.html.value}></textarea>
  </div>
{/if}
