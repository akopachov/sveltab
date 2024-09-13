<script lang="ts">
  import type { Settings } from './settings';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  export let settings: Settings;
</script>

<SettingsBase
  {settings}
  provider={{ href: 'https://commons.wikimedia.org/wiki/Main_Page', name: 'Wikimedia Commons' }} />

<BackgroundHistoryControl />
