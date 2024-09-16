<script lang="ts">
  import { AnimeTopics, type Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  export let settings: Settings;

  const { topic } = settings;

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
<SettingsBase {settings} provider={{ href: 'https://t.mwm.moe/us/', name: 't.mwm.moe' }} />

<BackgroundHistoryControl />
