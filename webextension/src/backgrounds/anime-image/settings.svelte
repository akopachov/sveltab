<script lang="ts">
  import { AnimeTopics, type Settings } from './settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import FilterSelector from '$shared-components/filter-selector.svelte';

  export let settings: Settings;

  const { topic, blur, filter } = settings;

  const topicNames: [AnimeTopics, string][] = [
    [AnimeTopics.Any, m.Backgrounds_AnimeImage_Settings_Topic_Any()],
    [AnimeTopics.AI, 'AI Drawing'],
    [AnimeTopics.ACG, 'ACG'],
    [AnimeTopics.MOE, 'MOE'],
    [AnimeTopics.OriginalGod, 'Original God'],
    [AnimeTopics.PCTransverse, 'PC Transverse'],
    [AnimeTopics.Landscape, 'Landscape'],
    [AnimeTopics.Genshin, 'Genshin'],
  ];
  let updateInterval = settings.updateInterval.value / 60;
  $: {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  }
</script>

<label class="label mb-2">
  <span>{m.Backgrounds_AnimeImage_Settings_Topic()}</span>
  <select class="select" bind:value={$topic}>
    {#each topicNames as [topic, name]}
      <option value={topic}>{name}</option>
    {/each}
  </select>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_AnimeImage_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_AnimeImage_Settings_Blur()}</span>
  <RangeSlider name="blurSlider" bind:value={$blur} min={0} max={15} step={0.1}></RangeSlider>
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_AnimeImage_Settings_Filter()}</span>
  <FilterSelector bind:filter={$filter} />
</label>
<div>
  <span class="text-xs opacity-50">
    {m.Backgrounds_AnimeImage_Settings_Disclaimer()}
    <a href="https://t.mwm.moe/us/" target="_blank" rel="noreferrer" referrerpolicy="no-referrer">t.mwm.moe</a>
  </span>
</div>

<button class="btn variant-soft" on:click={forceUpdateBackground}>
  {m.Backgrounds_AnimeImage_Settings_Refresh()}
</button>
