<script lang="ts">
  import type { Settings } from './settings';

  export let settings: Settings;

  function onChange(e: Event) {
    $settings.url = (<HTMLInputElement>e.target).value;
  }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
  <span>URL</span>
  <input type="url" class="input" value={$settings.url} on:change={onChange} />
</label>
