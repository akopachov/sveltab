<script lang="ts">
  import type { Settings } from './settings';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';

  export let settings: Settings;
</script>

<SettingsBase {settings} provider={{ href: 'https://apod.nasa.gov/apod/astropix.html', name: 'NASA' }} />
