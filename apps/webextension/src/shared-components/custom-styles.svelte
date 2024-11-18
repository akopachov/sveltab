<script lang="ts">
  let { styles = $bindable() }: { styles: string } = $props();
</script>

<textarea bind:value={styles} class="textarea font-mono"></textarea>
