<script lang="ts">
  import type { Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';
  import { AnimeTopics } from './api';

  let { settings }: { settings: Settings } = $props();

  const topicNames: [AnimeTopics | 'any', string][] = [
    ['any', m.Backgrounds_AnimeImage_Settings_Topic_Any()],
    [AnimeTopics.AI, 'AI Drawing'],
    [AnimeTopics.YCY, 'YCY'],
    [AnimeTopics.MOE, 'MOE'],
    [AnimeTopics.MOEZ, 'MOEZ'],
    [AnimeTopics.OriginalGod, 'Original God'],
    [AnimeTopics.PCTransverse, 'PC Transverse'],
    [AnimeTopics.Landscape, 'Landscape'],
    [AnimeTopics.BD, 'BD'],
    [AnimeTopics.Genshin, 'Genshin'],
    [AnimeTopics.MP, 'MP'],
    [AnimeTopics.MOEMP, 'MOEMP'],
    [AnimeTopics.YSMP, 'YSMP'],
    [AnimeTopics.AIMP, 'AIMP'],
    [AnimeTopics.LAI, 'LAI'],
    [AnimeTopics.XHL, 'XHL'],
  ];
  let updateInterval = $state(settings.updateInterval.value / 60);

  $effect(() => {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  });
</script>

<label class="label mb-2">
  <span>{m.Backgrounds_AnimeImage_Settings_Topic()}</span>
  <select id="cbxAnimeImageBgProvider_Settings_Topic" class="select" bind:value={settings.topic.value}>
    {#each topicNames as [topic, name]}
      <option value={topic}>{name}</option>
    {/each}
  </select>
</label>
<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="label">
  <span>{m.Backgrounds_AnimeImage_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<SettingsBase {settings} provider={{ href: 'https://t.alcy.cc', name: 't.alcy.cc' }} />

<BackgroundHistoryControl />
