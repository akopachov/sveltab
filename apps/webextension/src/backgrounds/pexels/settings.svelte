<script lang="ts">
  import type { Settings } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  export let settings: Settings;
  const { searchTerms } = settings;
  let updateInterval = settings.updateInterval.value / 60;
  $: {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  }
</script>

<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={$searchTerms}
    placeholder={m.Backgrounds_Pexels_Settings_SearchTerms_Placeholder()} />
</label>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>{m.Backgrounds_Pexels_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>

<SettingsBase {settings} provider={{ href: 'https://www.pexels.com', name: 'Pexels' }} />

<BackgroundHistoryControl />
