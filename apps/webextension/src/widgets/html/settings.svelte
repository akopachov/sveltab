<script context="module" lang="ts">
  const Tabs: never[] = [];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const { html } = settings;
</script>

{#if tab === GeneralTabId}
  <div class="label mb-2">
    <span>{m.Widgets_Html_Settings_Html()}</span>
    <textarea class="textarea" bind:value={$html}></textarea>
  </div>
{/if}
