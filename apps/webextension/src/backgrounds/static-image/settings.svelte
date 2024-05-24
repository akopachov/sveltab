<script lang="ts">
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';

  export let settings: Settings;

  const { url } = settings;
</script>

<label class="label">
  <span>{m.Backgrounds_StaticImage_Settings_Url()}</span>
  <input type="url" class="input" bind:value={$url} />
</label>

<SettingsBase {settings} />
