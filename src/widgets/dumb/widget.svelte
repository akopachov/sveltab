<script lang="ts">
  import type { Settings } from './settings.js';

  export let settings: Settings;
</script>

<div class="w-full h-full" style:background-color={$settings.color}></div>
