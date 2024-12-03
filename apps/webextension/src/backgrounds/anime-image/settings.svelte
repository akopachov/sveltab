<script lang="ts">
  import type { Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';
  import { getAnimeTags, type AnimeTagInfo } from './api';
  import TagSelector, { type TagDisplayInfo } from './tag-selector.svelte';
  import { Lazy } from '$lib/lazy';

  let { settings }: { settings: Settings } = $props();

  let updateInterval = $state(settings.updateInterval.value / 60);

  let availableTagsLazy = new Lazy<Promise<TagDisplayInfo[]>>(() =>
    getAnimeTags().then(tags => tags.map(tag => ({ value: tag.name, label: `${tag.name} (${tag.count})` }))),
  );

  $effect(() => {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  });
</script>

<label class="label mb-2">
  <span>{m.Backgrounds_AnimeImage_Settings_IncludeTags()}</span>
  <TagSelector
    bind:tags={settings.includeTags.value}
    id="animeImageIncludeTags"
    availableTags={availableTagsLazy.value}
    placeholder={m.Backgrounds_AnimeImage_Settings_IncludeTags_Placeholder()} />
</label>
<label class="label mb-2">
  <span>{m.Backgrounds_AnimeImage_Settings_ExcludeTags()}</span>
  <TagSelector
    bind:tags={settings.excludeTags.value}
    id="animeImageExcludeTags"
    availableTags={availableTagsLazy.value}
    placeholder={m.Backgrounds_AnimeImage_Settings_IncludeTags_Placeholder()} />
</label>
<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="label">
  <span>{m.Backgrounds_AnimeImage_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>
<SettingsBase {settings} provider={{ href: 'https://pic.re/', name: 'pic.re' }} />

<BackgroundHistoryControl class="mt-2" />
