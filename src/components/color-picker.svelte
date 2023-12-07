<script lang="ts">
  import ColorPicker from 'svelte-awesome-color-picker';
  export let color: string;
</script>

<div class="color-picker">
  <ColorPicker bind:hex={color} label="" />
</div>

<style>
  .color-picker {
    --picker-width: min(max(10cqmin, 150px), 250px);
    --picker-height: min(max(10cqmin, 150px), 250px);
  }
</style>
