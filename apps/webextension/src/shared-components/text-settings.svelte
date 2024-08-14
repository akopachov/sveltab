<script lang="ts">
  import * as m from '$i18n/messages';
  import type { FontSettings, ShadowSettings, TextStrokeSettings } from '$lib/widget-settings';
  import FontSelector from './font-selector.svelte';
  import ShadowSelector from './shadow-selector.svelte';
  import TextStrokeSelector from './text-stroke-selector.svelte';

  export let color: string | null | undefined = null;
  export let font: FontSettings;
  export let shadow: ShadowSettings | null | undefined = null;
  export let stroke: TextStrokeSettings | null | undefined = null;
</script>

<div class="label mb-2">
  <span>{m.TextSettings_Font()}</span>
  <FontSelector {font} bind:color />
</div>
{#if shadow}
  <div class="mt-2">
    <h4>{m.TextSettings_Shadow()}</h4>
    <div class="pl-4 pr-4">
      <ShadowSelector shadowSettings={shadow} />
    </div>
  </div>
{/if}
{#if stroke}
  <div class="mt-2">
    <h4>{m.TextSettings_Stroke()}</h4>
    <div class="pl-4 pr-4">
      <TextStrokeSelector settings={stroke} />
    </div>
  </div>
{/if}
