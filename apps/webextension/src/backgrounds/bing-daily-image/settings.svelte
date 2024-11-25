<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  let { settings }: { settings: Settings } = $props();
</script>

<label class="label">
  <span>{m.Backgrounds_BingDaily_Settings_Country()}</span>
  <select class="select" bind:value={settings.locale.value}>
    <option value="random">{m.Backgrounds_BingDaily_Settings_Country_Any()}</option>
    <option value="en-AU">{m.Backgrounds_BingDaily_Settings_Country_Australia()}</option>
    <option value="en-CA">{m.Backgrounds_BingDaily_Settings_Country_Canada()}</option>
    <option value="zh-CN">{m.Backgrounds_BingDaily_Settings_Country_China()}</option>
    <option value="de-DE">{m.Backgrounds_BingDaily_Settings_Country_Germany()}</option>
    <option value="ja-JP">{m.Backgrounds_BingDaily_Settings_Country_Japan()}</option>
    <option value="en-NZ">{m.Backgrounds_BingDaily_Settings_Country_NewZealand()}</option>
    <option value="en-GB">{m.Backgrounds_BingDaily_Settings_Country_UnitedKingdom()}</option>
    <option value="en-US">{m.Backgrounds_BingDaily_Settings_Country_UnitedStates()}</option>
  </select>
</label>
<SettingsBase {settings} provider={{ href: 'https://bing.com', name: 'Bing' }} />

<BackgroundHistoryControl class="mt-2" />
