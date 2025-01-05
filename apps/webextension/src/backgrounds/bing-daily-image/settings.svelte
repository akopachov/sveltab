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
    <option value="es-AR">{m.Backgrounds_BingDaily_Settings_Country_Argentina()}</option>
    <option value="en-AU">{m.Backgrounds_BingDaily_Settings_Country_Australia()}</option>
    <option value="de-AT">{m.Backgrounds_BingDaily_Settings_Country_Austria()}</option>
    <option value="pt-BR">{m.Backgrounds_BingDaily_Settings_Country_Brazil()}</option>
    <option value="en-CA">{m.Backgrounds_BingDaily_Settings_Country_Canada()}</option>
    <option value="es-CL">{m.Backgrounds_BingDaily_Settings_Country_Chile()}</option>
    <option value="zh-CN">{m.Backgrounds_BingDaily_Settings_Country_China()}</option>
    <option value="da-DK">{m.Backgrounds_BingDaily_Settings_Country_Denmark()}</option>
    <option value="fi-FI">{m.Backgrounds_BingDaily_Settings_Country_Finland()}</option>
    <option value="fr-FR">{m.Backgrounds_BingDaily_Settings_Country_France()}</option>
    <option value="de-DE">{m.Backgrounds_BingDaily_Settings_Country_Germany()}</option>
    <option value="en-IN">{m.Backgrounds_BingDaily_Settings_Country_India()}</option>
    <option value="it-IT">{m.Backgrounds_BingDaily_Settings_Country_Italy()}</option>
    <option value="ja-JP">{m.Backgrounds_BingDaily_Settings_Country_Japan()}</option>
    <option value="es-MX">{m.Backgrounds_BingDaily_Settings_Country_Mexico()}</option>
    <option value="en-NZ">{m.Backgrounds_BingDaily_Settings_Country_NewZealand()}</option>
    <option value="no-NO">{m.Backgrounds_BingDaily_Settings_Country_Norway()}</option>
    <option value="pl-PL">{m.Backgrounds_BingDaily_Settings_Country_Poland()}</option>
    <option value="pt-PT">{m.Backgrounds_BingDaily_Settings_Country_Portugal()}</option>
    <option value="es-ES">{m.Backgrounds_BingDaily_Settings_Country_Spain()}</option>
    <option value="sv-SE">{m.Backgrounds_BingDaily_Settings_Country_Sweden()}</option>
    <option value="en-GB">{m.Backgrounds_BingDaily_Settings_Country_UnitedKingdom()}</option>
    <option value="en-US">{m.Backgrounds_BingDaily_Settings_Country_UnitedStates()}</option>
  </select>
</label>
<SettingsBase {settings} provider={{ href: 'https://bing.com', name: 'Bing' }} />

<BackgroundHistoryControl class="mt-2" />
