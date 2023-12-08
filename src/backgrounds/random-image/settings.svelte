<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Settings } from './settings';

  export let settings: Settings;

  onDestroy(() => {
    settings.notifyPropertiesChanged();
  });
</script>

<label class="label">
  <span>Search terms</span>
  <input type="search" class="input" bind:value={settings.searchTerms} />
</label>
