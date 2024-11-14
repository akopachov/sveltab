<script lang="ts">
  import type { Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  let { settings }: { settings: Settings } = $props();

  let updateInterval = $state(settings.updateInterval.value / 60);

  $effect(() => {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  });
</script>

<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={settings.searchTerms.value}
    placeholder={m.Backgrounds_Pexels_Settings_SearchTerms_Placeholder()} />
</label>
<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>

<SettingsBase {settings} provider={{ href: 'https://www.pexels.com', name: 'Pexels' }} />

<BackgroundHistoryControl />
