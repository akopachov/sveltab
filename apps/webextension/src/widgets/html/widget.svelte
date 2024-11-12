<script lang="ts">
  import type { Settings } from './settings';

  let { settings }: { settings: Settings } = $props();
</script>

<div class="w-full h-full overflow-hidden hover:overflow-y-auto rounded-[inherit]">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html settings.html.value}
</div>
