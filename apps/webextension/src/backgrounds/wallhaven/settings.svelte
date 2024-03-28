<script lang="ts">
  import { type Settings, type WallhavenPurity, WallhavenSearchColors } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';
  import { nanoid } from 'nanoid/non-secure';

  export let settings: Settings;
  const { searchTerms, blur, filter, apiKey, purity, colors } = settings;
  let updateInterval = settings.updateInterval.value / 60;

  enum ContentPurity {
    SFW = 0,
    Sketchy = 1,
    NSFW = 2,
  }

  $: {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  }

  function updatePurity(target: HTMLInputElement, value: ContentPurity) {
    const purities = $purity.split('');
    purities[value] = target.checked ? '1' : '0';
    $purity = <WallhavenPurity>purities.join('');
  }
</script>

<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={$searchTerms}
    placeholder={m.Backgrounds_Wallhaven_Settings_SearchTerms_Placeholder()} />
</label>
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_ApiKey()}</span>
  <input type="password" class="input" autocomplete={nanoid()} bind:value={$apiKey} />
</label>
<div class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Purity()}</span>
  <div class="space-y-2">
    <label class="flex items-center space-x-2">
      <input
        class="checkbox"
        type="checkbox"
        checked={$purity[0] === '1'}
        on:change={e => updatePurity(e.currentTarget, ContentPurity.SFW)} />
      <span>{m.Backgrounds_Wallhaven_Settings_Purity_SFW()}</span>
    </label>
    <label class="flex items-center space-x-2">
      <input
        class="checkbox"
        type="checkbox"
        checked={$purity[1] === '1'}
        on:change={e => updatePurity(e.currentTarget, ContentPurity.Sketchy)} />
      <span>{m.Backgrounds_Wallhaven_Settings_Purity_Sketchy()}</span>
    </label>
    {#if $apiKey}
      <label class="flex items-center space-x-2">
        <input
          class="checkbox"
          type="checkbox"
          checked={$purity[2] === '1'}
          on:change={e => updatePurity(e.currentTarget, ContentPurity.NSFW)} />
        <span>{m.Backgrounds_Wallhaven_Settings_Purity_NSFW()}</span>
      </label>
    {/if}
  </div>
</div>
<div class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Colors()}</span>
  <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))]">
    {#each WallhavenSearchColors as color}
      <label
        style:--sv-outline-color="#{color}"
        class="[&>input:checked_~_span]:outline-[var(--sv-outline-color)] [&>input:checked~span]:outline-4 [&>input:checked~span]:outline aspect-square">
        <input type="checkbox" class="hidden" value={color} bind:group={$colors} />
        <span style:background-color="#{color}" class="block w-full h-full cursor-pointer"></span>
      </label>
    {/each}
  </div>
</div>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
</label>
<div>
  <span class="text-xs opacity-50">
    {m.Backgrounds_Wallhaven_Settings_Disclaimer()}
    <a class="anchor" href="https://wallhaven.cc" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">
      Wallhaven
    </a>
  </span>
</div>

<button class="btn variant-soft" on:click={forceUpdateBackground}>
  {m.Backgrounds_Wallhaven_Settings_Refresh()}
</button>
