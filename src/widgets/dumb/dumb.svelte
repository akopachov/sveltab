<script lang="ts">
  import type { DumbSettings } from './dumb-settings.ts';

  export let settings: DumbSettings;
</script>

<div class="w-full h-full" style:background-color={$settings.color}></div>
